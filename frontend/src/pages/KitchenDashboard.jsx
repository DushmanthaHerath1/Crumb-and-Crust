import { useAdminAuth } from "../hooks/useAdminAuth";
import Button from "../components/ui/Button";

export default function KitchenDashboard() {
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface p-6 sm:p-12 text-on-surface">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary">
              Kitchen Orders Dashboard
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              Logged in as: <span className="font-semibold text-on-surface">{user?.sub || "Admin"}</span> ({user?.role || "Staff"})
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-auto px-4"
          >
            Log Out
          </Button>
        </header>

        <div className="rounded-lg border border-white/10 bg-surface-container-low p-8 text-center text-on-surface-variant">
          <p className="font-body text-base">
            Phase 6 Kitchen Dashboard view. Ready for live order stream integration.
          </p>
        </div>
      </div>
    </div>
  );
}
