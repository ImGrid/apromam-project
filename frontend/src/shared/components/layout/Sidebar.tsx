/**
 * Navegacion lateral del dashboard
 * Links adaptados segun rol del usuario
 */

import { Link, useLocation } from "react-router-dom";
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

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: () => boolean;
}

export function Sidebar() {
  const location = useLocation();
  const permissions = usePermissions();

  // Configuracion de navegacion por rol
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
      path: ROUTES.DASHBOARD,
      icon: BarChart3,
      permission: () => permissions.hasPermission("report"),
    },
  ];

  // Filtrar items segun permisos
  const visibleItems = navItems.filter(
    (item) => !item.permission || item.permission()
  );

  // Verificar si la ruta esta activa
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

      {/* Footer info */}
      <div className="p-4 mt-auto border-t border-neutral-border">
        <p className="text-xs text-center text-text-secondary">
          APROMAM © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
