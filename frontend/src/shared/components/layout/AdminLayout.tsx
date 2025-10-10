import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Layout principal del dashboard
 * Este es un ESQUELETO - se completará en Fase 3 con:
 * - Sidebar con navegación por rol
 * - Header con usuario y menú
 * - Hamburger menu para móvil
 * - Integración con authStore
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-neutral-bg">
      {/* Sidebar - Placeholder (Fase 3) */}
      <aside className="hidden w-64 bg-white border-r lg:block border-neutral-border">
        <div className="flex items-center justify-center h-16 border-b border-neutral-border">
          <span className="text-sm font-medium text-text-secondary">
            Sidebar (Fase 3)
          </span>
        </div>
        <nav className="p-4">
          <p className="text-xs text-center text-text-secondary">
            Navegación pendiente
          </p>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header - Placeholder (Fase 3) */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm border-neutral-border sm:px-6">
          {/* Hamburger menu (móvil) - Fase 3 */}
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md lg:hidden text-text-secondary hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Título */}
          <h1 className="text-lg font-semibold text-text-primary">
            Dashboard APROMAM
          </h1>

          {/* User menu placeholder */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-text-secondary sm:block">
              Usuario (Fase 3)
            </span>
            <div className="w-8 h-8 rounded-full bg-primary-light" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
