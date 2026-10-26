import { Loader2 } from "lucide-react";

export default function OrderActionButtons({
  status,
  onReady,
  onComplete,
  isLoading = false,
}) {
  if (status === "completed") {
    return (
      <span className="inline-block px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-gray-400 bg-gray-100 border border-gray-200 rounded-sm cursor-not-allowed select-none">
        Completed
      </span>
    );
  }

  const isReady = status === "ready_for_pickup";
  const label = isReady ? "Mark as completed" : "Mark as ready";
  const handleClick = isReady ? onComplete : onReady;

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold tracking-wider uppercase rounded-sm hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
    >
      {isLoading && <Loader2 className="size-3.5 animate-spin shrink-0" />}
      <span>{label}</span>
    </button>
  );
}
