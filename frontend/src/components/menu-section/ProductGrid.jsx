import FeaturedProductCard from "./FeaturedProductCard";
import ProductCard from "./ProductCard";

// Backend returns price as a raw float (e.g. 7.5) — format it for display
function formatPrice(price) {
  return "$" + Number(price).toFixed(2);
}

function ProductGrid({ products = [], onAddToCart }) {
  // If no products after filtering, show a friendly empty state
  if (products.length === 0) {
    return (
      <section aria-label="Menu products" className="px-5 md:px-20">
        <p className="text-on-surface-variant text-sm">
          No items in this category.
        </p>
      </section>
    );
  }

  // First product is the featured card; the rest go in the regular grid (deprecated)
  // const [featuredProduct, ...restProducts] = products;

  //reads is_featured from the API
  const featuredProduct = products.find((p) => p.is_featured);
  const restProducts = products.filter((p) => !p.is_featured);

  if (!featuredProduct) {
    return (
      <section aria-label="Menu products" className="px-5 md:px-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              imageUrl={product.image_url}
              price={formatPrice(product.price)}
              description={product.description}
              onAddToCart={() => onAddToCart?.(product)}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Menu products" className="px-5 md:px-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <FeaturedProductCard
            key={featuredProduct.id}
            name={featuredProduct.name}
            imageUrl={featuredProduct.image_url}
            price={formatPrice(featuredProduct.price)}
            description={featuredProduct.description}
            onAddToCart={() => onAddToCart?.(featuredProduct)}
          />
        </div>

        {restProducts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            imageUrl={product.image_url}
            price={formatPrice(product.price)}
            description={product.description}
            onAddToCart={() => onAddToCart?.(product)}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
