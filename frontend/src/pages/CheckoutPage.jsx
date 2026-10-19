import { Link } from "react-router-dom";
import { CreditCard, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";

import { OrderSummary } from "../components/OrderSummary";
import { GuestInfoSection } from "../components/GuestInfoSection";
import { PickupScheduler } from "../components/PickupScheduler";

import { useCheckoutForm } from "../hooks/useCheckoutForm";

function CheckoutPage() {
  const {
    // Cart Data
    cart,
    cartTotal,
    maxLeadTime,
    availability,
    availabilityStatus,

    // Form & UI States
    formData,
    errors,
    touched,
    dateIndex,
    agreed,
    isSubmitting,
    isFormValid,
    serverError,

    // Action Handlers
    handleChange,
    handleBlur,
    setDateIndex,
    setAgreed,
    handleSubmit,
  } = useCheckoutForm();

  if (!cart || cart.length === 0) {
    //this logic could be remove by just disabeling the "procreed to checkout button in cart drawer"
    return (
      <div className="min-h-screen bg-background font-body text-on-surface">
        <main className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="font-heading text-3xl font-bold text-on-surface">
            Your Cart is Empty
          </h1>
          <p className="mt-3 font-body text-base text-on-surface-variant">
            Reviewing your order requires at least one bake in your cart.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-primary-container px-6 py-3 font-body text-sm font-semibold text-on-primary-container transition-transform hover:scale-105"
          >
            Explore Menu
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-12 md:px-16 lg:grid-cols-5 lg:gap-16">
        {/* Left Column: Order Summary (Figma 2 cols) */}
        <OrderSummary
          cart={cart}
          cartTotal={cartTotal}
          maxLeadTime={maxLeadTime}
        />

        {/* Right Column: Checkout Form (Figma 3 cols) */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-12 lg:col-span-3"
        >
          {/* Backend Error Alert Banner */}
          {serverError && (
            <div className="flex items-start gap-3 rounded-md border border-error/20 bg-error/10 p-4 text-error">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="font-body text-sm leading-relaxed">
                <strong>Submission Error:</strong> {serverError}
              </div>
            </div>
          )}

          {/* Section 1: Customer Information */}
          <GuestInfoSection
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          {/* Section 2: Pickup Date & Time Selection */}
          <PickupScheduler
            days={availability.days}
            status={availabilityStatus}
            dateIndex={dateIndex}
            onSelectDate={setDateIndex}
            maxLeadTime={maxLeadTime}
            pickupTime={formData.pickupTime}
            onSelectTime={(time) => handleChange("pickupTime", time)}
          />

          {/* Section 3: Terms & Submission Action */}
          <section className="flex flex-col gap-6 border-t border-white/5 pt-10">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 size-4 shrink-0 rounded-sm accent-primary-container cursor-pointer"
              />
              <span className="font-body text-sm leading-relaxed text-on-surface-variant">
                I agree to the Terms of Service and understand that orders
                cannot be cancelled within {maxLeadTime} hours of pickup.
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={CreditCard}
              disabled={!isFormValid}
              isLoading={isSubmitting}
            >
              Pay with Stripe
            </Button>
          </section>
        </form>
      </main>
    </div>
  );
}

export default CheckoutPage;
