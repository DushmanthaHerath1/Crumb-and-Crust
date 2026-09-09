import AddToCartButton from "../ui/AddToCartButton";

function ProductCard({
  name,
  price,
  description,
  imageUrl,
  imageAlt,
  onAddToCart,
}) {
  return (
    <article
      className="
        w-full overflow-hidden rounded-lg border border-white/10
        bg-surface-container shadow-lg
      "
    >
      {/* Image: 256px tall on desktop, 192px on tablet/mobile (h-64 / h-48 are exact scale matches) */}
      <div className="h-48 w-full bg-surface-container-high lg:h-64">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt ?? name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-6 font-body">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-xl leading-normal text-on-surface">{name}</h4>
          <span className="shrink-0 text-xl leading-normal text-primary">{price}</span>
        </div>

        {description && (
          <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>
        )}

        <AddToCartButton onClick={onAddToCart} size="responsive" />
      </div>
    </article>
  );
}

export default ProductCard;
