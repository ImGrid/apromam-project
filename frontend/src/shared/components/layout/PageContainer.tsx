/**
 * Contenedor generico para paginas
 * Aplica padding consistente y maneja titulo
 */

import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageContainer({
  children,
  title,
  description,
  actions,
}: PageContainerProps) {
  return (
    <div className="space-y-6">
      {/* Header de la pagina */}
      {(title || actions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-secondary sm:text-base">
                {description}
              </p>
            )}
          </div>

          {/* Acciones (botones) */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Contenido */}
      <div>{children}</div>
    </div>
  );
}
