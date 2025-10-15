/**
 * FichaLayout
 * Layout específico para formularios multi-step de fichas
 * Estructura IDÉNTICA a AdminLayout pero renderiza FichaSidebar en lugar de Sidebar
 * Header y Breadcrumbs en la misma posición que el resto del sistema
 */

import type { ReactNode } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Breadcrumbs } from "@/shared/components/layout/Breadcrumbs";

interface FichaLayoutProps {
  children: ReactNode;
  title?: string;
  sidebar: ReactNode; // FichaSidebar se pasa como prop
  onMobileMenuToggle?: () => void;
}

export function FichaLayout({
  children,
  title,
  sidebar,
  onMobileMenuToggle,
}: FichaLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Sidebar (FichaSidebar pasado como prop) */}
      {sidebar}

      {/* Main content - MISMA estructura que AdminLayout */}
      <div className="flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <Header title={title} onMenuClick={onMobileMenuToggle} />

        {/* Breadcrumbs */}
        <div className="px-4 py-3 bg-white border-b sm:px-6 lg:px-8 border-neutral-border">
          <Breadcrumbs />
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
