import { useState, useCallback, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Leaf,
  ClipboardList,
  BarChart3,
  Users,
} from "lucide-react";
import { Header } from "@/shared/components/layout/Header";
import { Breadcrumbs } from "@/shared/components/layout/Breadcrumbs";
import { ROUTES } from "@/shared/config/routes.config";

interface GerenteLayoutProps {
  children: ReactNode;
  title?: string;
}

// Navegacion especifica para gerente
const gerenteNavItems = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Comunidades",
    path: ROUTES.COMUNIDADES,
    icon: Building2,
  },
  {
    label: "Productores",
    path: ROUTES.PRODUCTORES,
    icon: Leaf,
  },
  {
    label: "Fichas",
    path: ROUTES.FICHAS,
    icon: ClipboardList,
  },
  {
    label: "Técnicos",
    path: ROUTES.USUARIOS,
    icon: Users,
  },
  {
    label: "Reportes",
    path: ROUTES.DASHBOARD,
    icon: BarChart3,
  },
];

function GerenteSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden w-64 h-screen overflow-y-auto bg-white border-r lg:block border-neutral-border">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-neutral-border">
        <Link to={ROUTES.DASHBOARD} className="flex items-center">
          <img
            src="/apromam_logo.webp"
            alt="APROMAM"
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {gerenteNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-neutral-border">
        <p className="text-xs text-center text-text-secondary">
          APROMAM © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}

function GerenteMobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-white lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-border">
          <Link to={ROUTES.DASHBOARD} className="flex items-center" onClick={onClose}>
            <img
              src="/apromam_logo.webp"
              alt="APROMAM"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-text-secondary hover:bg-neutral-bg"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {gerenteNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export function GerenteLayout({ children, title }: GerenteLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <GerenteSidebar />
      <GerenteMobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} onMenuClick={handleOpenMobileMenu} />

        <div className="px-4 py-3 bg-white border-b sm:px-6 lg:px-8 border-neutral-border">
          <Breadcrumbs />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
