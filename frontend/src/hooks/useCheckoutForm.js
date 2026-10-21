import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/useCartStore";

export function useCheckoutForm() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const cart = useCartStore((state) => state.cart);
  const cartTotal = useCartStore((state) => state.cartTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const productIds = useMemo(
    () => cart.map((item) => item.id).join(","),
    [cart],
  );
  const [availability, setAvailability] = useState({
    days: [],
    lead_time_hours: 0,
  });
  const [availabilityStatus, setAvailabilityStatus] = useState("loading");

  // Form & UI States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pickupTime: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dateIndex, setDateIndex] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const idempotencyKeyRef = useRef(crypto.randomUUID());
  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, [
    cart,
    formData.fullName,
    formData.email,
    formData.phone,
    formData.pickupTime,
  ]);

  useEffect(() => {
    if (!productIds) return;
    const controller = new AbortController();
    setAvailabilityStatus("loading");

    const loadAvailability = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/availability?product_ids=${productIds}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        const data = await res.json();
        setAvailability(data);
        setDateIndex(null);
        setFormData((prev) => ({ ...prev, pickupTime: "" }));
        setAvailabilityStatus("ready");
      } catch (err) {
        if (err.name !== "AbortError") {
          setAvailabilityStatus("error");
        }
      }
    };
    loadAvailability();

    return () => controller.abort();
  }, [productIds]);

  const selectedSlot = availability?.days?.[dateIndex]?.slots?.find(
    (s) => s.start === formData.pickupTime,
  );

  const validateField = (field, value) => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Enter a valid email address";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (value.replace(/\D/g, "").length < 9)
          return "Phone must have at least 9 digits";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const isFormValid =
    formData.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.phone.replace(/\D/g, "").length >= 9 &&
    dateIndex !== null &&
    selectedSlot?.available === true &&
    agreed;

  const handleCreateOrder = async () => {
    if (!isFormValid || isSubmitting) {
      throw new Error("Please complete all required fields correctly.");
    }

    // setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        customer_details: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        cart_items: cart.map((item) => ({
          product_id: Number(item.id),
          quantity: Number(item.quantity),
        })),
        requested_pickup_datetime: formData.pickupTime,
        idempotency_key: idempotencyKeyRef.current,
      };

      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        const errorDetail = Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg).join(", ")
          : data.detail || "Failed to process order";
        throw new Error(errorDetail);
      }

      if (!data.paypal_order_id) {
        throw new Error("Missing Paypal order ID in server response. ");
      }

      return data.paypal_order_id;
    } catch (err) {
      idempotencyKeyRef.current = crypto.randomUUID();
      setServerError(err.message);
      setIsSubmitting(false);
      throw err;
    }
  };

  const handleApprove = async (data, actions) => {
    try {
      const captureResponse = await fetch(
        `${BACKEND_URL}/api/orders/${data.orderID}/capture`,
        { method: "POST", headers: { "Content-Type": "application/json" } },
      );
      let captureData = {};
      setIsSubmitting(true);
      try {
        captureData = await captureResponse.json();
      } catch {}

      if (!captureResponse.ok) {
        if (captureData.detail === "INSTRUMENT_DECLINED") {
          return actions.restart();
        }
        throw new Error(captureData.detail || "Payment capture failed.");
      }

      if (clearCart) {
        clearCart();
      }

      navigate("/order-confirmed", {
        state: { orderDetails: captureData },
      });
    } catch (err) {
      setServerError(
        err.message || "An error occurred during payment capture.",
      );
      setIsSubmitting(false);
    }
  };

  const handleError = (err) => {
    console.error("paypal SDK Error:", err);
    setServerError(
      "An unexpected error occurred with PayPal. Please try again.",
    );
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setIsSubmitting(false);
  };

  return {
    cart,
    cartTotal,
    maxLeadTime: availability.lead_time_hours,
    availability,
    availabilityStatus,
    formData,
    errors,
    touched,
    dateIndex,
    agreed,
    isSubmitting,
    isFormValid,
    serverError,
    handleChange,
    handleBlur,
    setDateIndex,
    setAgreed,
    handleCreateOrder,
    handleApprove,
    handleError,
    handleCancel,
  };
}
