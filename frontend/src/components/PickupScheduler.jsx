import { Calendar, Info, Lock } from "lucide-react";
import { Select } from "./ui/Select";

function DateOption({ day, index, disabled, selected, onSelect }) {
  console.log("Days prop received:", day); //debug

  const date = new Date(`${day.date}T00:00:00`);

  const caption =
    index === 0
      ? "Today"
      : index === 1
        ? "Tomorrow"
        : date.toLocaleDateString("en-AU", { weekday: "short" });

  const dayLabel = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });

  const stateClasses = disabled
    ? "cursor-not-allowed border-white/5 bg-surface-container-lowest opacity-50"
    : selected
      ? "border-primary bg-surface-container"
      : "border-white/10 bg-surface-container-low hover:border-primary";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-1 rounded-md border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${stateClasses}`}
    >
      <span
        className={`text-label-caps ${disabled ? "text-on-surface-variant" : "text-primary"}`}
      >
        {caption}
      </span>
      <span className="font-body text-base font-semibold leading-normal text-on-surface">
        {dayLabel}
      </span>
      {disabled && <Lock className="size-3 text-on-surface-variant mt-0.5" />}
    </button>
  );
}

export function PickupScheduler({
  days = [],
  status,
  dateIndex,
  onSelectDate,
  maxLeadTime,
  pickupTime,
  onSelectTime,
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-white/5 py-10">
      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-heading text-3xl font-bold leading-snug text-primary">
          <Calendar className="size-6 shrink-0" />
          Pickup Scheduling
        </h2>

        {maxLeadTime > 0 && (
          <div className="flex gap-3 rounded-md border border-white/5 bg-surface-container p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="font-body text-base leading-relaxed text-on-surface-variant">
              {maxLeadTime}h lead time: your cart needs at least {maxLeadTime}{" "}
              hours of preparation, so earlier slots are unavailable.
            </p>
          </div>
        )}
      </div>

      {/* Date Options Grid */}
      {status === "loading" && (
        <p className="text-sm text-gray-500">Loading availability…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">
          Couldn't load pickup times. Please refresh.
        </p>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="pb-2 font-body text-xs font-bold uppercase leading-none tracking-wider text-on-surface-variant">
          Select pickup date
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {days.map((day, i) => (
            <DateOption
              key={day.date}
              day={day}
              index={i}
              disabled={!day.slots.some((s) => s.available)}
              selected={dateIndex === i}
              onSelect={() => onSelectDate(i)}
            />
          ))}
        </div>
      </fieldset>

      {/* Time Slot Select */}
      <div className="py-2">
        <Select
          id="pickupTime"
          label="Select pickup time"
          placeholder="Choose a time slot..."
          required
          value={pickupTime}
          onChange={(e) => onSelectTime(e.target.value)}
          options={(days[dateIndex]?.slots ?? [])
            .filter((s) => s.available)
            .map((s) => ({ value: s.start, label: s.label }))}
          disabled={dateIndex === null}
        />
      </div>
    </section>
  );
}
