export const fieldBaseClasses =
  "w-full rounded-md border border-white/10 bg-surface-container-lowest px-4 py-3.5 font-body text-base text-on-surface placeholder:text-surface-bright focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block font-body text-xs font-bold uppercase leading-none tracking-wider text-on-surface-variant"
  >
    {children}
  </label>
);

export function Field({ id, label, error, className = "", ...inputProps }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        id={id}
        name={id}
        className={`${fieldBaseClasses} ${
          error ? "border-error focus:border-error focus:ring-error" : ""
        }`}
        {...inputProps}
      />
      {error && <span className="font-body text-xs text-error">{error}</span>}
    </div>
  );
}
