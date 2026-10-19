import { ShoppingCart } from "lucide-react";

function AddToCartButton({
  onClick,
  label = "Add to Cart",
  showIcon = false,
  size = "responsive",
  className = "",
}) {
  const paddingClasses = size === "comfortable" ? "py-3" : "py-2 lg:py-3"; //Explain

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center justify-center gap-2 rounded-[8px]
        border border-primary-container ${paddingClasses}
        text-xs font-normal leading-none tracking-widest text-primary-container
        transition-colors hover:bg-primary-container-hover hover:text-on-primary-container
        active:bg-primary-container-active
        ${className}
      `}
    >
      {showIcon && (
        <ShoppingCart size={14} className="shrink-0" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}

export default AddToCartButton;
