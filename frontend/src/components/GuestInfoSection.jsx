import { Field } from "./ui/Field";

export function GuestInfoSection({
  formData,
  errors,
  touched,
  onChange,
  onBlur,
}) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl font-bold leading-snug text-primary">
          Guest Checkout
        </h2>
        <p className="font-body text-base leading-relaxed text-on-surface-variant">
          Enter your details. We'll use this to notify you about your order.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <Field
          id="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          onBlur={() => onBlur("fullName")}
          error={touched.fullName ? errors.fullName : undefined}
          required
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            onBlur={() => onBlur("email")}
            error={touched.email ? errors.email : undefined}
            required
          />

          <Field
            id="phone"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            onBlur={() => onBlur("phone")}
            error={touched.phone ? errors.phone : undefined}
            required
          />
        </div>
      </div>
    </section>
  );
}
