function MenuFilter({ categories = [], activeTab, onTabChange }) {
  return (
    <section className="flex flex-col px-5 md:px-20 gap-6 w-full">
      {/* Heading */}
      <div className="flex flex-col">
        <h3 className="font-heading font-bold text-primary text-2xl md:text-3xl leading-tight">
          Our Menu
        </h3>
      </div>

      <div className="flex flex-row gap-4 overflow-x-auto md:pb-2 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                flex items-center justify-center py-2 px-6 rounded-full whitespace-nowrap
                font-body text-xs tracking-widest transition-colors
                ${
                  isActive
                    ? "bg-surface-container-highest border border-white/10 text-primary"
                    : "bg-transparent border border-transparent text-on-surface-variant hover:text-primary"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default MenuFilter;
