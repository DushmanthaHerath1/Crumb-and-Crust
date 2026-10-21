import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, MapPin } from "lucide-react";
import Button from "../components/ui/Button";
import bakeryHeroImg from "../assets/images/hero-bg.png";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  // Format pickup datetime strictly in the bakery's local timezone (Australia/Sydney)
  const formattedPickupTime = React.useMemo(() => {
    if (!orderDetails?.pickup_datetime) return null;

    // Ensure ISO string ends with 'Z' so JavaScript treats it as UTC
    let dateStr = String(orderDetails.pickup_datetime);
    if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
      dateStr += "Z";
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Sydney", // Bakery's local operating timezone
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }, [orderDetails?.pickup_datetime]);

  return (
    <div className="min-h-screen w-full bg-surface flex items-center justify-center p-5">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-md border border-white/10 bg-surface-container-low shadow-xl shadow-primary-container/10 px-6 py-12 sm:px-10 sm:py-16 md:px-20 md:py-20 flex flex-col items-center text-center">
        {/* Atmospheric Glow */}
        <div
          className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-secondary-container/15 blur-3xl"
          aria-hidden="true"
        />

        {/* 1. Illustration (Top, matching Figma) */}
        <div className="relative z-10 mb-6">
          <div className="w-44 h-44 rounded-full border-2 border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
            <img
              src={bakeryHeroImg}
              alt="Artisanal Bakery"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 2. Success Badge Icon (Below the image, matching Figma) */}
        <div className="relative z-10 flex items-center justify-center text-primary mb-3">
          <CheckCircle2 className="size-8 stroke-[2.2]" aria-hidden="true" />
        </div>

        {/* 3. Heading */}
        <h1 className="relative z-10 font-heading text-display-lg-mobile md:text-display-lg font-bold text-on-surface mb-2">
          Payment
          <br />
          Successful!
        </h1>

        {/* 4. Order ID (Larger font size & tracking) */}
        <p className="relative z-10 font-mono text-sm md:text-base font-semibold text-on-surface-variant mb-6 tracking-widest uppercase">
          ORDER ID: #
          {orderDetails?.order_id
            ? `ORD-${orderDetails.order_id}`
            : "CONFIRMED"}
        </p>

        {/* 5. Divider */}
        <div className="relative z-10 w-16 h-px bg-white/10 mb-8" />

        {/* 6. Estimated Pickup Info */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <p className="text-lg md:text-xl font-medium text-on-surface-variant mb-2">
            Estimated Pickup Time
          </p>
          <p className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            {formattedPickupTime || "Ready on Selected Date"}
          </p>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-surface-container px-4 py-2">
            <MapPin
              className="size-4 text-on-surface-variant"
              aria-hidden="true"
            />
            <span className="text-sm md:text-base text-on-surface-variant">
              Fitzroy Flagship Store
            </span>
          </div>
        </div>

        {/* 7. Friendly UX Copy (No email mention, prompts screenshot) */}
        <p className="relative z-10 text-sm md:text-base leading-relaxed text-on-surface-variant/80 max-w-md mb-8">
          Thank you for choosing Crumb & Crust! Our bakers will have your fresh
          artisanal bakes ready for pickup on time. Please screenshot this
          screen for your records.
        </p>

        {/* 8. Back to Storefront Button */}
        <div className="relative z-10 w-full max-w-xs">
          <Link to="/" className="w-full block">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-semibold"
            >
              Back to Storefront
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
