import { Minus, Plus, Trash2 } from "lucide-react";
import { money } from "../../utils/formatter";

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
          {money(item.price * item.quantity)}
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
          <Minus size={12} />
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
          <Plus size={12} />
        </button>
      </div>

      {/* Delete button */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.name} from cart`}
        className="shrink-0 text-on-surface-variant transition-colors hover:text-error"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default CartItem;
