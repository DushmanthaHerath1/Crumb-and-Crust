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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )}
      {label}
    </button>
  );
}

export default AddToCartButton;
