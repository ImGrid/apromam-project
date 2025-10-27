import type { ReactNode } from "react";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`${title ? 'space-y-6' : ''} ${className}`}>
      {/* Header de la sección - solo si hay título */}
      {title && (
        <div className="pb-4 border-b border-neutral-border">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}

      {/* Campos de la sección */}
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}
