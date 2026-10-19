import { ChevronDown } from "lucide-react";
import { Label, fieldBaseClasses } from "./Field";

export function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Choose an option...",
  error,
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className={`${fieldBaseClasses} appearance-none py-3 pr-12 ${
            error ? "border-error focus:border-error focus:ring-error" : ""
          }`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
      </div>
      {error && <span className="font-body text-xs text-error">{error}</span>}
    </div>
  );
}
