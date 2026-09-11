import useCartStore from "../../store/useCartStore";
import CartItem from "./CartItem";

function CartDrawer() {
  const cart = useCartStore((state) => state.cart);
  const cartTotal = useCartStore((state) => state.cartTotal());
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  //cart items
  const cartItems = cart.map((item) => (
    <CartItem
      key={item.id}
      item={item}
      onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
      onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
      onRemove={() => removeFromCart(item.id)}
    />
  ));
  return (
    <>
      <div
        onClick={closeCart}
        className={`
          fixed inset-0 z-40 bg-surface/80 backdrop-blur-sm
          transition-opacity duration-300
          ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      <aside
        className={`
          fixed right-0 top-0 z-50 flex h-full w-full flex-col
          bg-surface-container-low border-l border-white/10 shadow-2xl
          transition-transform duration-300 ease-in-out
          md:w-100
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Your Cart
          </h2>

          {/* Close × button */}
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* ── Empty state (shown when cart has no items) ─────────────── */}
          {cart.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="font-body text-base text-on-surface-variant">
                Your cart is empty.
              </p>
              <p className="font-body text-sm text-on-surface-variant">
                Start adding some bakes!
              </p>
            </div>
          )}

          {/* ── Item rows ──────────────────────────────────────────────── */}
          <ul className="flex flex-col divide-y divide-white/10">
            {cartItems}
          </ul>
        </div>

        {/* ── Footer (sticky bottom) ───────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5">
          {/* Subtotal row */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-on-surface-variant">
              Subtotal
            </span>
            <span className="font-body text-base font-bold text-on-surface">
              ${cartTotal.toFixed(2)}
            </span>
          </div>

          {/* Proceed to Checkout — primary action */}
          <button
            className="
            w-full rounded-md bg-primary-container py-3 font-body text-sm
            font-normal tracking-widest text-on-primary-container
            transition-all duration-200 ease-in-out
            hover:scale-[1.02] hover:cursor-pointer active:scale-[0.98]
          "
          >
            Proceed to Checkout
          </button>

          {/* Clear Cart — ghost/destructive secondary */}
          <button
            onClick={clearCart}
            className="
            w-full rounded-md border border-white/10 py-3 font-body text-sm
            tracking-widest text-on-surface-variant
            transition-all duration-200 hover:border-error/40 hover:text-error
          "
          >
            Clear Cart
          </button>
        </div>
      </aside>
    </>
  );
}

export default CartDrawer;
