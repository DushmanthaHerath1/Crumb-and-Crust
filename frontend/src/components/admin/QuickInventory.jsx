import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

import { useAdminAuth } from "../../hooks/useAdminAuth";
import { money } from "../../utils/formatter";

function StockBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex px-2 py-0.5 border border-green-500 bg-green-100 text-green-950 text-[11px] font-bold tracking-wider uppercase rounded-sm">
      In stock
    </span>
  ) : (
    <span className="inline-flex px-2 py-0.5 border border-primary-container bg-orange-100 text-orange-950 text-[11px] font-bold tracking-wider uppercase rounded-sm">
      Out of stock
    </span>
  );
}

function AvailabilityToggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex items-center w-11 h-6 border rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed ${
        checked
          ? "bg-primary-container border-primary-container"
          : "bg-gray-200 border-gray-300"
      }`}
    >
      <span
        className={`block size-4 bg-white rounded-full transition-transform shadow-sm ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function QuickInventory() {
  const { token, logout } = useAdminAuth();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // Fetch all products (both active and inactive)
  const fetchProducts = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load inventory");
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Unable to fetch inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL, token, logout]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Availability Toggle
  const handleToggle = async (productId, currentActive) => {
    setTogglingId(productId);
    const newActive = !currentActive;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/products/${productId}/availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: newActive }),
        },
      );

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to update availability.");
        return;
      }

      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p)),
      );
    } catch {
      alert("Network error updating product availability.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm font-body">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
            Quick Inventory
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Toggling off immediately hides an item from the customer menu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 sm:size-3 rounded-full bg-primary-container" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {products.length} Items
            </span>
          </div>
          <button
            type="button"
            onClick={fetchProducts}
            title="Refresh products"
            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200 rounded-sm transition-colors"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 border-b border-red-200 bg-red-50 text-sm text-red-700"
        >
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {isLoading && products.length === 0 ? (
        <div className="flex items-center justify-center p-16 text-gray-500 gap-3">
          <Loader2 className="size-6 animate-spin text-primary-container" />
          <span className="text-sm font-medium">Loading inventory...</span>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-140 text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500">
                  Item
                </th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500">
                  Status
                </th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500 text-right">
                  Update Availability
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const isUpdating = togglingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Item Name, Category & Price */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {product.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.category || "General"} •{" "}
                          {money(product.price)}
                        </span>
                      </div>
                    </td>

                    {/* Stock Badge */}
                    <td className="p-4 align-middle">
                      <StockBadge isActive={product.is_active} />
                    </td>

                    {/* Toggle Switch */}
                    <td className="p-4 align-middle text-right">
                      <div className="inline-flex items-center gap-2">
                        {isUpdating && (
                          <Loader2 className="size-4 animate-spin text-primary-container" />
                        )}
                        <AvailabilityToggle
                          checked={product.is_active}
                          disabled={isUpdating}
                          onChange={() =>
                            handleToggle(product.id, product.is_active)
                          }
                          label={`Toggle availability for ${product.name}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
