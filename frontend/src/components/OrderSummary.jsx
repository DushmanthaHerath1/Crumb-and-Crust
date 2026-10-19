import { money } from "../utils/formatter";

export function OrderSummary({ cart, cartTotal, maxLeadTime }) {
  return (
    <aside className="self-start rounded-md border border-white/5 bg-surface-container-low p-6 shadow-2xl md:p-8 lg:sticky lg:top-10 lg:col-span-2">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-3xl font-bold leading-snug text-primary">
            Your Order
          </h2>
          <p className="font-body text-base leading-relaxed text-on-surface-variant">
            Review your selection before finalizing your pickup.
          </p>
        </header>

        {/* Dynamic Cart Items */}
        <div className="flex flex-col divide-y divide-white/5">
          {cart.map((item) => {
            const lineSubtotal = Number(item.price || 0) * (item.quantity || 1);

            return (
              <div
                key={item.id}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-md bg-surface-container-high">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={`${item.name} bake`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center font-body text-xs text-on-surface-variant">
                      Bake
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                  <div>
                    <h3 className="font-body text-lg font-semibold leading-normal text-on-surface truncate">
                      {item.name}
                    </h3>
                    <p className="font-body text-sm text-on-surface-variant">
                      {money(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-on-surface-variant">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-body text-lg font-semibold leading-normal text-primary">
                      {money(lineSubtotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead Time Notice */}
        {maxLeadTime > 0 && (
          <div className="rounded-md border border-primary/20 bg-primary/10 p-4">
            <p className="font-body text-xs leading-relaxed text-primary">
              ⏱ <strong>Notice:</strong> Your order requires at least{" "}
              <strong>{maxLeadTime} hours</strong> preparation time due to
              sourdough fermentation.
            </p>
          </div>
        )}

        {/* Total Price Section */}
        <dl className="flex flex-col gap-3 py-2 font-body border-t border-white/5 pt-4">
          <div className="flex justify-between text-base leading-relaxed text-on-surface-variant">
            <dt>Subtotal</dt>
            <dd>{money(cartTotal)}</dd>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/10 py-4 text-xl font-semibold leading-normal">
            <dt className="text-on-surface">Total</dt>
            <dd className="text-primary">{money(cartTotal)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
