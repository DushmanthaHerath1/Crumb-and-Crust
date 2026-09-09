import { useState } from "react";
import MenuFilter from "./MenuFilter";
import ProductGrid from "./ProductGrid";
import TextButton from "../ui/TextButton";

function MenuSection({ onAddToCart, menu = [], isLoading, error }) {
  // Derive unique categories from whatever the API returns — adding a new
  // category to the DB automatically adds a tab here, zero code changes needed.
  const categories = [
    "All",
    ...new Set(menu.map((p) => p.category).filter(Boolean)),
  ];

  const [activeTab, setActiveTab] = useState("All");

  // "All" shows every active product; any other tab filters by category
  const filteredProducts =
    activeTab === "All" ? menu : menu.filter((p) => p.category === activeTab);

  return (
    <section className="mx-auto flex flex-col gap-8 py-16 md:py-20 lg:py-30">
      <div className="flex flex-col gap-6">
        <MenuFilter
          categories={categories}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Error state — shown when the API fetch failed */}
        {error && (
          <p className="px-5 md:px-20 text-sm text-red-400">
            Could not load the menu. Please try again later.
          </p>
        )}

        {/* Loading state — shown while fetch is in-flight */}
        {isLoading && !error && (
          <p className="px-5 md:px-20 text-sm text-on-surface-variant">Loading menu…</p>
        )}

        {/* Grid — only rendered once data is ready and there's no error */}
        {!isLoading && !error && (
          <ProductGrid products={filteredProducts} onAddToCart={onAddToCart} />
        )}

        <TextButton label="See Full Menu" />
      </div>
    </section>
  );
}

export default MenuSection;
