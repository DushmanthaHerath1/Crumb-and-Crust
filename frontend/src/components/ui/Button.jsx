// src/components/ui/Button.jsx
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  label,
  type = "button",
  variant = "primary", // "primary" | "outline" | "ghost"
  size = "md", // "sm" | "md" | "lg"
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex w-full items-center justify-center gap-2 rounded-md font-body font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]";

  const variants = {
    primary:
      "bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/15 hover:bg-primary-container-hover active:bg-primary-container-active",
    outline:
      "border border-primary-container text-primary-container hover:text-on-primary-container active:bg-primary-container-active",
    ghost: "bg-transparent text-on-surface hover:bg-surface-container-high",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs tracking-wider",
    md: "px-4 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-4 text-base md:text-lg font-bold",
  };

  const content = children || label;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-5 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon className="size-5 shrink-0" aria-hidden="true" />
          )}
          <span>{content}</span>
          {Icon && iconPosition === "right" && (
            <Icon className="size-5 shrink-0" aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
}
