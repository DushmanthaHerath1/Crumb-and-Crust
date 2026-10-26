import { useAdminAuth } from "../../hooks/useAdminAuth";
import { LogOut } from "lucide-react";

export default function DashboardTopBar() {
  const { user, logout } = useAdminAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <span className="font-heading text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Crumb &amp; Crust
        </span>
        <span className="text-gray-300">|</span>
        <span className="font-body text-sm sm:text-base font-medium text-gray-700">
          Staff Portal
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user?.sub && (
          <span className="text-xs text-gray-500 hidden sm:inline-block">
            {user.sub} {user.role && `(${user.role})`}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-primary-container"
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
