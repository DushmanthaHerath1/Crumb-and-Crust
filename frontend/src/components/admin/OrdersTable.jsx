import StatusBadge from "./StatusBadge";
import OrderActionButtons from "./OrderActionButtons";
import { formatOrderRef, formatPickupTime } from "../../utils/formatter";

function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "No items";
  }

  return items
    .map((item) => `${item.quantity}x ${item.product_name || "Item"}`)
    .join(", ");
}

export default function OrdersTable({
  title,
  dotClass = "bg-primary-container",
  countLabel,
  orders = [],
  onReady,
  onComplete,
  updatingOrderId = null,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`size-2.5 sm:size-3 rounded-full ${dotClass}`} />
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            {countLabel}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No orders in this section for the selected date.
          </div>
        ) : (
          <table className="w-full min-w-160 text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500">
                  Customer
                </th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500">
                  Items
                </th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500 text-center">
                  Pickup
                </th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => {
                const orderRef = formatOrderRef(order.id);
                const customerName =
                  order.customer_json?.name || "Guest Customer";
                const contactParts = [
                  order.customer_json?.phone,
                  order.customer_json?.email,
                ].filter(Boolean);
                const contactInfo = contactParts.join(" • ") || "—";
                const itemsText = formatOrderItems(order.items);
                const pickupTime = formatPickupTime(order.pickup_datetime);

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-500">
                          {orderRef}
                        </span>
                        <span className="font-bold text-gray-900">
                          {customerName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {contactInfo}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 align-middle text-sm text-gray-800 max-w-xs">
                      {itemsText}
                    </td>

                    <td className="p-4 align-middle">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-base font-bold text-gray-900">
                          {pickupTime}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                    </td>

                    <td className="p-4 align-middle text-right">
                      <OrderActionButtons
                        status={order.status}
                        onReady={() => onReady(order.id)}
                        onComplete={() => onComplete(order.id)}
                        isLoading={updatingOrderId === order.id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
