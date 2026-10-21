export const fieldBaseClasses =
  "w-full rounded-md border border-white/10 bg-surface-container-lowest px-4 py-3.5 font-body text-base text-on-surface placeholder:text-surface-bright focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export const Label = ({
  htmlFor,
  children,
  variant = "dark",
  className = "",
}) => (
  <label
    htmlFor={htmlFor}
    className={`block font-body text-xs font-bold uppercase leading-none tracking-wider ${
      variant === "light" ? "text-gray-900" : "text-on-surface-variant"
    } ${className}`}
  >
    {children}
  </label>
);

export function Field({
  id,
  label,
  error,
  icon: Icon,
  rightElement,
  variant = "dark",
  className = "",
  ...inputProps
}) {
  const isLight = variant === "light";
  const inputStyles = isLight
    ? "w-full rounded-sm border border-gray-300 bg-gray-50 px-4 py-3 font-body text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
    : fieldBaseClasses;

  const iconColor = isLight ? "text-gray-400" : "text-on-surface-variant/60";
  const errorColor = isLight ? "text-red-600" : "text-error";
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <Label htmlFor={id} variant={variant}>
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 ${iconColor}`}
          />
        )}
        <input
          id={id}
          name={id}
          className={`${inputStyles} ${Icon ? "pl-10" : ""} ${
            rightElement ? "pr-10" : ""
          } ${
            error
              ? isLight
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-error focus:border-error focus:ring-error"
              : ""
          }`}
          {...inputProps}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className={`font-body text-xs ${errorColor}`}>{error}</span>
      )}
    </div>
  );
}
