import { useState, useCallback, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Leaf,
  ClipboardList,
  PlusCircle,
  MapPin,
} from "lucide-react";
import { Header } from "@/shared/components/layout/Header";
import { Breadcrumbs } from "@/shared/components/layout/Breadcrumbs";
import { ROUTES } from "@/shared/config/routes.config";

interface TecnicoLayoutProps {
  children: ReactNode;
  title?: string;
}

// Navegacion simplificada para tecnico
const tecnicoNavItems = [
  {
    label: "Inicio",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Nueva Ficha",
    path: ROUTES.FICHAS_CREATE,
    icon: PlusCircle,
    highlighted: true,
  },
  {
    label: "Mis Fichas",
    path: ROUTES.FICHAS,
    icon: ClipboardList,
  },
  {
    label: "Mis Productores",
    path: ROUTES.PRODUCTORES,
    icon: Leaf,
  },
  {
    label: "Parcelas",
    path: ROUTES.PARCELAS,
    icon: MapPin,
  },
];

function TecnicoSidebar() {
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
        <img
          src="https://apromam.com/wp-content/uploads/2021/01/cropped-LOGO-APROMAM-H-1024x322.png"
          alt="APROMAM"
          className="h-10"
        />
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {tecnicoNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.highlighted && !active
                      ? "bg-primary/10 text-primary border-2 border-primary hover:bg-primary/20"
                      : active
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

function TecnicoMobileSidebar({
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
          <img
            src="https://apromam.com/wp-content/uploads/2021/01/cropped-LOGO-APROMAM-H-1024x322.png"
            alt="APROMAM"
            className="h-10"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-md text-text-secondary hover:bg-neutral-bg"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {tecnicoNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.highlighted && !active
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : active
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

export function TecnicoLayout({ children, title }: TecnicoLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <TecnicoSidebar />
      <TecnicoMobileSidebar
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
