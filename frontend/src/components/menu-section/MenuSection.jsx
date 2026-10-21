import { useState } from "react";
import MenuFilter from "./MenuFilter";
import ProductGrid from "./ProductGrid";
import TextButton from "../ui/TextButton";

function MenuSection({ menu = [], isLoading, error }) {
  const categories = [
    "All",
    ...new Set(menu.map((p) => p.category).filter(Boolean)),
  ];

  const [activeTab, setActiveTab] = useState("All");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredProducts =
    activeTab === "All" ? menu : menu.filter((p) => p.category === activeTab);

  const featured = filteredProducts.find((p) => p.is_featured);
  const regularProducts = filteredProducts.filter((p) => !p.is_featured);

  const displayedProducts =
    activeTab === "All" && !isExpanded
      ? featured
        ? [featured, ...regularProducts.slice(0, 3)]
        : filteredProducts.slice(0, 4)
      : filteredProducts;

  return (
    <section
      id="menu"
      className="mx-auto flex flex-col gap-8 py-16 md:py-20 lg:py-section-gap"
    >
      <div className="flex flex-col gap-6">
        <MenuFilter
          categories={categories}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsExpanded(false);
          }}
        />

        {error && (
          <p className="px-5 md:px-20 text-sm text-red-400">
            Could not load the menu. Please try again later.
          </p>
        )}

        {isLoading && !error && (
          <p className="px-5 md:px-20 text-sm text-on-surface-variant">
            Loading menu…
          </p>
        )}

        {!isLoading && !error && <ProductGrid products={displayedProducts} />}

        {activeTab == "All" && filteredProducts.length > 4 && (
          <TextButton
            label={isExpanded ? "See less" : "See Full Menu"}
            onClick={() => setIsExpanded((prev) => !prev)}
          />
        )}
      </div>
    </section>
  );
}

export default MenuSection;
