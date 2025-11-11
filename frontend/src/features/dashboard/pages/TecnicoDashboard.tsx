import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  FileEdit,
} from "lucide-react";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/Button";
import { StatCard } from "../components/StatCard";
import { MisFichasTabs } from "../components/MisFichasTabs";
import { useMisFichas } from "../hooks/useMisFichas";
import { ROUTES } from "@/shared/config/routes.config";
import { useAuth } from "@/shared/hooks/useAuth";

export function TecnicoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { borradores, enRevision, aprobadas, isLoading } = useMisFichas();

  return (
    <TecnicoLayout title="Inicio">
      <PageContainer
        title={`Hola, ${user?.nombre_completo?.split(" ")[0] || "Técnico"}`}
        actions={
          <Button
            onClick={() => navigate(ROUTES.FICHAS_CREATE)}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Ficha
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Estadisticas de Fichas */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Mis Fichas - Resumen
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                title="Total Fichas"
                value={borradores.length + enRevision.length + aprobadas.length}
                icon={FileText}
                color="primary"
                loading={isLoading}
              />
              <StatCard
                title="Borradores"
                value={borradores.length}
                icon={FileEdit}
                color="warning"
                loading={isLoading}
              />
              <StatCard
                title="En Revisión"
                value={enRevision.length}
                icon={Clock}
                color="info"
                loading={isLoading}
              />
              <StatCard
                title="Aprobadas"
                value={aprobadas.length}
                icon={CheckCircle}
                color="success"
                loading={isLoading}
              />
            </div>
          </div>

          {/* Mis fichas */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Mis Fichas
            </h3>
            <MisFichasTabs
              borradores={borradores}
              enRevision={enRevision}
              aprobadas={aprobadas}
              loading={isLoading}
            />
          </div>
        </div>
      </PageContainer>
    </TecnicoLayout>
  );
}
