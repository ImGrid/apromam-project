/**
 * Grid de acciones rapidas
 * Botones grandes con iconos para acciones principales
 */

import { useNavigate } from "react-router-dom";
import { UserPlus, Building2, Leaf, MapPin, BookOpen } from "lucide-react";
import { ROUTES } from "@/shared/config/routes.config";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: string;
  permission?: () => boolean;
}

export function QuickActions() {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      label: "Nuevo Usuario",
      icon: UserPlus,
      onClick: () => navigate(ROUTES.USUARIOS_CREATE),
      color: "bg-primary hover:bg-primary-dark",
    },
    {
      label: "Nueva Comunidad",
      icon: Building2,
      onClick: () => navigate(ROUTES.COMUNIDADES_CREATE),
      color: "bg-success hover:bg-green-700",
    },
    {
      label: "Nuevo Productor",
      icon: Leaf,
      onClick: () => navigate(ROUTES.PRODUCTORES_CREATE),
      color: "bg-info hover:bg-blue-700",
    },
    {
      label: "Gestionar Geografía",
      icon: MapPin,
      onClick: () => navigate(ROUTES.GEOGRAFICAS),
      color: "bg-warning hover:bg-orange-700",
    },
    {
      label: "Configurar Catálogos",
      icon: BookOpen,
      onClick: () => navigate(ROUTES.CATALOGOS),
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <PermissionGate key={action.label} permission="all">
            <button
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-3 p-6 text-white rounded-lg transition-colors ${action.color}`}
            >
              <Icon className="w-8 h-8" />
              <span className="text-sm font-medium text-center">
                {action.label}
              </span>
            </button>
          </PermissionGate>
        );
      })}
    </div>
  );
}
