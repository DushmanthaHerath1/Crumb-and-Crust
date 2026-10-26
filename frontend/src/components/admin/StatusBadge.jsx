const STATUS_CONFIG = {
  paid: {
    label: "Pending",
    classes: "bg-gray-200 border-gray-300 text-gray-900",
  },
  ready_for_pickup: {
    label: "Ready for pickup",
    classes: "bg-orange-100 border-[#ee671c] text-orange-950",
  },
  completed: {
    label: "Completed",
    classes: "bg-green-100 border-green-500 text-green-950",
  },
};

export default function StatusBadge({ status }) {
  // Fallback to 'paid' config if an unrecognized status arrives
  const config = STATUS_CONFIG[status] || {
    label: status ? status.replace(/_/g, " ") : "Unknown",
    classes: "bg-gray-100 border-gray-300 text-gray-600",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 border text-[11px] font-bold tracking-wider uppercase rounded-sm ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
