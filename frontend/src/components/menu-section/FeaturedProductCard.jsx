import AddToCartButton from "../ui/AddToCartButton";

function FeaturedProductCard({
  name,
  description,
  price,
  badge = "Top Seller",
  imageUrl,
  imageAlt,
  onAddToCart,
}) {
  return (
    <article
      className="
        relative w-full overflow-hidden rounded-lg border border-white/10
        bg-surface-container shadow-lg
      "
    >
      {/* Image: 256px tall on tablet/mobile, 320px on desktop (h-64 / h-80 are exact scale matches) */}
      <div className="h-64 w-full bg-surface-container-high lg:h-80">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt ?? name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* "Top Seller" badge */}
      {badge ? (
        <span
          className="
            absolute left-4 top-4 rounded-full border border-white/10
            bg-surface-container-highest/80 px-3 py-1 text-xs leading-none
            tracking-widest text-on-surface backdrop-blur-sm
          "
        >
          {badge}
        </span>
      ) : null}

      {/* Content */}
      <div className="flex flex-col gap-4 p-6 font-body">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-xl leading-normal text-on-surface">{name}</h4>
            <p className="text-base leading-relaxed text-on-surface-variant">
              {description}
            </p>
          </div>
          <span className="shrink-0 text-xl leading-normal text-primary">
            {price}
          </span>
        </div>

        <div className="pt-4">
          <AddToCartButton
            onClick={onAddToCart}
            showIcon={true}
            size="comfortable"
          />
        </div>
      </div>
    </article>
  );
}

export default FeaturedProductCard;
