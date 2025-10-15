/**
 * Sidebar mobile con overlay
 * Se muestra al hacer click en el menu hamburguesa
 */

import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Building2,
  Leaf,
  ClipboardList,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { ROUTES } from "@/shared/config/routes.config";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: () => boolean;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const permissions = usePermissions();

  // Cerrar al cambiar de ruta
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Prevenir scroll del body cuando esta abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Usuarios",
      path: ROUTES.USUARIOS,
      icon: Users,
      permission: () => permissions.canAccess("usuarios", "read"),
    },
    {
      label: "Comunidades",
      path: ROUTES.COMUNIDADES,
      icon: Building2,
      permission: () => permissions.canAccess("comunidades", "read"),
    },
    {
      label: "Geografía",
      path: ROUTES.GEOGRAFICAS,
      icon: MapPin,
      permission: () => permissions.canAccess("geograficas", "read"),
    },
    {
      label: "Catálogos",
      path: ROUTES.CATALOGOS,
      icon: BookOpen,
      permission: () => permissions.canAccess("catalogos", "read"),
    },
    {
      label: "Productores",
      path: ROUTES.PRODUCTORES,
      icon: Leaf,
      permission: () => permissions.canAccess("productores", "read"),
    },
    {
      label: "Parcelas",
      path: ROUTES.PARCELAS,
      icon: MapPin,
      permission: () => permissions.canAccess("parcelas", "read"),
    },
    {
      label: "Fichas",
      path: ROUTES.FICHAS,
      icon: ClipboardList,
      permission: () => permissions.canAccess("fichas", "read"),
    },
    {
      label: "Reportes",
      path: ROUTES.REPORTES,
      icon: BarChart3,
      permission: () => permissions.hasPermission("report"),
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.permission || item.permission()
  );

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-white lg:hidden">
        {/* Header */}
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
            className="p-2 rounded-md text-text-secondary hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
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
    </>
  );
}
