import { useState, useCallback, type ReactNode } from "react";
import { Header } from "@/shared/components/layout/Header";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { MobileSidebar } from "@/shared/components/layout/MobileSidebar";
import { Breadcrumbs } from "@/shared/components/layout/Breadcrumbs";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Sidebar mobile */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />

      {/* Main content */}
      <div className="flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <Header title={title} onMenuClick={handleOpenMobileMenu} />

        {/* Breadcrumbs */}
        <div className="px-4 py-3 bg-white border-b sm:px-6 lg:px-8 border-neutral-border">
          <Breadcrumbs />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
