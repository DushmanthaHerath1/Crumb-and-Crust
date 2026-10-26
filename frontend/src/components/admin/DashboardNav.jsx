import { ClipboardList, Package } from "lucide-react";

export default function DashboardNav({ activeTab = "orders", onTabChange }) {
  const tabs = [
    {
      id: "orders",
      label: "Orders",
      mobileLabel: "Orders",
      icon: ClipboardList,
    },
    {
      id: "inventory",
      label: "Quick Inventory",
      mobileLabel: "Inventory",
      icon: Package,
    },
  ];

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 flex-col gap-2 py-6 px-4 bg-white border-r border-gray-200 z-20">
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors text-left ${
                  isActive
                    ? "bg-primary-container text-white font-bold shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 font-medium"
                }`}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white border-t border-gray-200 flex items-center justify-around shadow-lg pb-[env(safe-area-inset-bottom)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-6 text-xs transition-colors ${
                isActive
                  ? "text-primary-container font-bold"
                  : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{tab.mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
