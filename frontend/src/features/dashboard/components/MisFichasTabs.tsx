/**
 * Tabs para organizar fichas del tecnico
 * Borradores, En Revision, Aprobadas
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileEdit, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/config/routes.config";

interface Ficha {
  id_ficha: string;
  codigo_productor: string;
  nombre_productor?: string;
  fecha_inspeccion: string;
  estado_ficha: string;
}

interface MisFichasTabsProps {
  borradores: Ficha[];
  enRevision: Ficha[];
  aprobadas: Ficha[];
  loading?: boolean;
}

type TabType = "borradores" | "revision" | "aprobadas";

export function MisFichasTabs({
  borradores,
  enRevision,
  aprobadas,
  loading = false,
}: MisFichasTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("borradores");
  const navigate = useNavigate();

  const tabs = [
    {
      id: "borradores" as TabType,
      label: "Borradores",
      icon: FileEdit,
      count: borradores.length,
      fichas: borradores,
    },
    {
      id: "revision" as TabType,
      label: "En Revisión",
      icon: Clock,
      count: enRevision.length,
      fichas: enRevision,
    },
    {
      id: "aprobadas" as TabType,
      label: "Aprobadas",
      icon: CheckCircle,
      count: aprobadas.length,
      fichas: aprobadas,
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab)!;

  const getActionButton = (ficha: Ficha) => {
    if (activeTab === "borradores") {
      return (
        <Button
          size="small"
          variant="primary"
          onClick={() => navigate(ROUTES.FICHAS_EDIT(ficha.id_ficha))}
        >
          Continuar
        </Button>
      );
    }

    return (
      <Button
        size="small"
        variant="secondary"
        onClick={() => navigate(ROUTES.FICHAS_DETAIL(ficha.id_ficha))}
      >
        Ver Detalle
      </Button>
    );
  };

  return (
    <div className="bg-white border rounded-lg border-neutral-border">
      {/* Tabs header */}
      <div className="flex border-b border-neutral-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-neutral-bg text-text-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border rounded-lg animate-pulse border-neutral-border"
              >
                <div className="w-1/3 h-4 mb-2 rounded bg-neutral-bg" />
                <div className="w-1/2 h-3 rounded bg-neutral-bg" />
              </div>
            ))}
          </div>
        ) : currentTab.fichas.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-secondary">
              No tienes fichas en este estado
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTab.fichas.map((ficha) => (
              <div
                key={ficha.id_ficha}
                className="flex items-center justify-between p-4 transition-shadow border rounded-lg border-neutral-border hover:shadow-sm"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">
                    {ficha.codigo_productor}
                  </h4>
                  {ficha.nombre_productor && (
                    <p className="text-sm text-text-secondary">
                      {ficha.nombre_productor}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary">
                    {new Date(ficha.fecha_inspeccion).toLocaleDateString()}
                  </p>
                </div>

                {getActionButton(ficha)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
