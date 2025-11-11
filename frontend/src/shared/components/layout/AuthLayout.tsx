import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-neutral-bg via-white to-neutral-bg sm:px-6 lg:px-8">
      {/* Container principal */}
      <div className="w-full max-w-md">
        {/* Logo y encabezado */}
        {showLogo && (
          <div className="mb-8 text-center">
            {/* Logo APROMAM */}
            <div className="mb-6">
              <img
                src="/apromam_logo.webp"
                alt="APROMAM"
                className="object-contain w-auto mx-auto h-28 sm:h-20"
              />
            </div>

            {/* Título opcional */}
            {title && (
              <h1 className="mb-2 text-2xl font-semibold text-text-primary sm:text-3xl">
                {title}
              </h1>
            )}

            {/* Subtítulo opcional */}
            {subtitle && (
              <p className="text-sm text-text-secondary sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Card de contenido */}
        <div className="p-6 bg-white border rounded-lg shadow-md border-neutral-border sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-center text-text-secondary sm:text-sm">
          APROMAM © {new Date().getFullYear()} - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
