function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <li className="flex items-center gap-4 py-4">
      {/* Thumbnail placeholder — replaced by image_url later */}
      <div className="h-14 w-14 shrink-0 rounded-md bg-surface-container-high overflow-hidden">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Name + price */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="font-body text-sm leading-snug text-on-surface truncate">
          {item.name}
        </span>
        <span className="font-body text-sm text-primary">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>

      {/* Quantity stepper: − qty + */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onDecrease}
          aria-label={`Decrease quantity of ${item.name}`}
          className="
                      flex h-7 w-7 items-center justify-center rounded-md
                      border border-white/10 text-on-surface-variant
                      transition-colors hover:border-primary/40 hover:text-primary
                    "
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <span className="w-5 text-center font-body text-sm text-on-surface">
          {item.quantity}
        </span>

        <button
          onClick={onIncrease}
          aria-label={`Increase quantity of ${item.name}`}
          className="
                      flex h-7 w-7 items-center justify-center rounded-md
                      border border-white/10 text-on-surface-variant
                      transition-colors hover:border-primary/40 hover:text-primary
                    "
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Delete button */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.name} from cart`}
        className="shrink-0 text-on-surface-variant transition-colors hover:text-error"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </li>
  );
}

export default CartItem;
