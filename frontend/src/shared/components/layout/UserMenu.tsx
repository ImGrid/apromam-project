/**
 * Menu desplegable de usuario
 * Muestra rol, perfil y opcion de logout
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { ROUTES } from "@/shared/config/routes.config";

// Colores de badge por rol
const ROLE_COLORS: Record<string, string> = {
  administrador: "bg-role-admin-bg text-role-admin-text border border-role-admin-border",
  gerente: "bg-role-gerente-bg text-role-gerente-text border border-role-gerente-border",
  tecnico: "bg-role-tecnico-bg text-role-tecnico-text border border-role-tecnico-border",
  invitado: "bg-neutral-100 text-neutral-700 border border-neutral-300",
  productor: "bg-role-productor-bg text-role-productor-text border border-role-productor-border",
};

export function UserMenu() {
  const { user } = useAuth();
  const { logout, isLoading } = useLogout();
  const permissions = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera
  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const roleColor =
    ROLE_COLORS[user.nombre_rol.toLowerCase()] || ROLE_COLORS.invitado;

  // Iniciales del usuario
  const initials = user.nombre_completo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 transition-colors rounded-lg hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-primary"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-primary">
          {initials}
        </div>

        {/* Info usuario (oculto en mobile) */}
        <div className="hidden text-left lg:block">
          <p className="text-sm font-medium text-text-primary">
            {user.nombre_completo}
          </p>
          {user.comunidades && user.comunidades.length > 0 && (
            <p className="text-xs text-text-secondary">
              {user.comunidades.length === 1
                ? user.comunidades[0].nombre_comunidad
                : `${user.comunidades.length} comunidades`}
            </p>
          )}
        </div>

        {/* Icono chevron */}
        <ChevronDown
          className={`w-5 h-5 text-text-secondary transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 bg-white border rounded-lg shadow-lg border-neutral-border">
          {/* Header del menu */}
          <div className="px-4 py-3 border-b border-neutral-border">
            <p className="text-sm font-medium text-text-primary">
              {user.nombre_completo}
            </p>
            <p className="text-xs text-text-secondary">{user.email}</p>

            {/* Badge de rol */}
            <span
              className={`inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full ${roleColor}`}
            >
              {user.nombre_rol}
            </span>
          </div>

          {/* Opciones del menu */}
          <div className="py-2">
            {/* Mi Perfil */}
            <Link
              to={ROUTES.PERFIL}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm transition-colors text-text-primary hover:bg-neutral-bg"
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </Link>

            {/* Configuración - Solo Admin */}
            {permissions.isAdmin() && (
              <Link
                to={ROUTES.CONFIGURACION}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors text-text-primary hover:bg-neutral-bg"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="py-2 border-t border-neutral-border">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center w-full gap-3 px-4 py-2 text-sm transition-colors text-error hover:bg-error/10 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
