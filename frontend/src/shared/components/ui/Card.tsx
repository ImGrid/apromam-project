import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  variant?: "default" | "outlined" | "elevated";
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  title,
  footer,
  variant = "default",
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
        <div className="px-4 py-3 border-b sm:px-6 border-neutral-border">
          <h3 className="text-base font-semibold text-text-primary sm:text-lg">
            {title}
          </h3>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 sm:px-6">{children}</div>

      {/* Footer opcional */}
      {footer && (
        <div className="px-4 py-3 border-t sm:px-6 bg-neutral-bg/50 border-neutral-border">
          {footer}
        </div>
      )}
    </div>
  );
}
