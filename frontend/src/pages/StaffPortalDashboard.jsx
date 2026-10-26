import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import DashboardTopBar from "../components/admin/DashboardTopBar";
import DashboardNav from "../components/admin/DashboardNav";
import OrdersTable from "../components/admin/OrdersTable";
import QuickInventory from "../components/admin/QuickInventory";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { formatPickupTime } from "../utils/formatter";

export default function StaffPortalDashboard() {
  const { token, logout } = useAdminAuth();

  const [activeTab, setActiveTab] = useState("orders");

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = selectedDate
        ? `${BACKEND_URL}/api/admin/orders?date=${selectedDate}`
        : `${BACKEND_URL}/api/admin/orders`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Unable to fetch orders.");
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL, selectedDate, token, logout]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Order Status Transition (PATCH)
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_status: newStatus }),
        },
      );

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to update order status.");
        return;
      }

      const updatedOrder = await res.json();
      // update order in state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o)),
      );
    } catch {
      alert("Network error updating status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Download Orders as CSV
  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      alert("No orders to download for this date.");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Email",
      "Pickup Time",
      "Status",
      "Items",
      "Total Price",
    ];

    const rows = orders.map((o) => [
      `#ORD-${o.id}`,
      `"${o.customer_json?.name || ""}"`,
      `"${o.customer_json?.phone || ""}"`,
      `"${o.customer_json?.email || ""}"`,
      formatPickupTime(o.pickup_datetime),
      o.status,
      `"${(o.items || [])
        .map((i) => `${i.quantity}x ${i.product_name || "Item"}`)
        .join(", ")}"`,
      o.total_price || "0.00",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${selectedDate || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived order subsets
  const activeOrders = orders.filter((o) => o.status !== "completed");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingCount = activeOrders.filter((o) => o.status === "paid").length;

  return (
    <div className="min-h-screen bg-gray-50 font-body text-gray-900">
      <DashboardTopBar />

      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex flex-col gap-8 pt-20 px-4 sm:px-8 pb-24 md:pb-12 md:ml-64 min-w-0 max-w-full overflow-x-hidden">
        {activeTab === "inventory" ? (
          <QuickInventory />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-sm shadow-sm pb-20 md:pb-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-gray-500">
                  Showing orders for:
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-sm bg-gray-50 focus-within:border-primary-container">
                  <Calendar className="size-4 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-sm sm:text-base font-semibold text-gray-900 focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchOrders}
                  title="Refresh orders"
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <RefreshCw
                    className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded-sm hover:bg-gray-800 transition-colors"
              >
                <Download className="size-4" />
                <span>Download Orders (CSV)</span>
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-3 p-4 rounded-sm border border-red-200 bg-red-50 text-sm text-red-700"
              >
                <AlertCircle className="size-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isLoading && orders.length === 0 ? (
              <div className="flex items-center justify-center p-16 text-gray-500 gap-3">
                <Loader2 className="size-6 animate-spin text-primary-container" />
                <span className="text-sm font-medium">Loading orders...</span>
              </div>
            ) : (
              <>
                <OrdersTable
                  title="Active Orders"
                  dotClass="bg-primary-container"
                  countLabel={`${pendingCount} Pending`}
                  orders={activeOrders}
                  onReady={(id) => handleUpdateStatus(id, "ready_for_pickup")}
                  onComplete={(id) => handleUpdateStatus(id, "completed")}
                  updatingOrderId={updatingOrderId}
                />

                <OrdersTable
                  title="Completed"
                  dotClass="bg-green-500"
                  countLabel={`${completedOrders.length} Completed`}
                  orders={completedOrders}
                  onReady={(id) => handleUpdateStatus(id, "ready_for_pickup")}
                  onComplete={(id) => handleUpdateStatus(id, "completed")}
                  updatingOrderId={updatingOrderId}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
