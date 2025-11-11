import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Building2, Leaf, MapPin, BookOpen } from "lucide-react";
import { ROUTES } from "@/shared/config/routes.config";
import { PermissionGate } from "@/shared/components/layout/PermissionGate";
import { CreateUsuarioModal } from "@/features/usuarios/components/CreateUsuarioModal";
import { CreateComunidadModal } from "@/features/comunidades/components/CreateComunidadModal";
import { CreateProductorModal } from "@/features/productores/components/CreateProductorModal";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: string;
  permission?: () => boolean;
  useModal?: boolean;
}

interface QuickActionsProps {
  onRefresh?: () => void;
}

export function QuickActions({ onRefresh }: QuickActionsProps) {
  const navigate = useNavigate();
  const [usuarioModalOpen, setUsuarioModalOpen] = useState(false);
  const [comunidadModalOpen, setComunidadModalOpen] = useState(false);
  const [productorModalOpen, setProductorModalOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      label: "Nuevo Usuario",
      icon: UserPlus,
      onClick: () => setUsuarioModalOpen(true),
      color: "bg-primary hover:bg-primary-dark",
      useModal: true,
    },
    {
      label: "Nueva Comunidad",
      icon: Building2,
      onClick: () => setComunidadModalOpen(true),
      color: "bg-success hover:bg-success-700",
      useModal: true,
    },
    {
      label: "Nuevo Productor",
      icon: Leaf,
      onClick: () => setProductorModalOpen(true),
      color: "bg-info hover:bg-info-700",
      useModal: true,
    },
    {
      label: "Gestionar Geografía",
      icon: MapPin,
      onClick: () => navigate(ROUTES.GEOGRAFICAS),
      color: "bg-warning hover:bg-warning-700",
      useModal: false,
    },
    {
      label: "Configurar Catálogos",
      icon: BookOpen,
      onClick: () => navigate(ROUTES.CATALOGOS),
      color: "bg-purple-600 hover:bg-purple-700",
      useModal: false,
    },
  ];

  const handleSuccess = () => {
    // Refrescar dashboard despues de crear entidad
    onRefresh?.();
  };

  return (
    <>
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

      {/* Modales */}
      <CreateUsuarioModal
        isOpen={usuarioModalOpen}
        onClose={() => setUsuarioModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <CreateComunidadModal
        isOpen={comunidadModalOpen}
        onClose={() => setComunidadModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <CreateProductorModal
        isOpen={productorModalOpen}
        onClose={() => setProductorModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
