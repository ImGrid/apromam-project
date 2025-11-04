import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  variant?: "default" | "outlined" | "elevated";
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  title,
  footer,
  variant = "default",
  compact = false,
  className = "",
  onClick,
}: CardProps) {
  const isClickable = !!onClick;

  const variantClasses = {
    default: "bg-white border border-neutral-border",
    outlined: "bg-white border-2 border-primary/20",
    elevated: "bg-white shadow-md border border-neutral-border",
  };

  const clickableClasses = isClickable
    ? "cursor-pointer transition-shadow hover:shadow-lg active:shadow-sm touch-target"
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg overflow-hidden
        ${variantClasses[variant]}
        ${clickableClasses}
        ${className}
      `}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Title opcional */}
      {title && (
        <div
          className={`border-b border-neutral-border ${
            compact ? "px-3 py-2" : "px-4 py-3 sm:px-6"
          }`}
        >
          <h3
            className={`font-semibold text-text-primary ${
              compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
            }`}
          >
            {title}
          </h3>
        </div>
      )}

      {/* Content */}
      <div className={compact ? "px-3 py-3" : "px-4 py-4 sm:px-6"}>
        {children}
      </div>

      {/* Footer opcional */}
      {footer && (
        <div
          className={`border-t bg-neutral-bg/50 border-neutral-border ${
            compact ? "px-3 py-2" : "px-4 py-3 sm:px-6"
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
