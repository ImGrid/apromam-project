import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Card, showToast } from "@/shared/components/ui";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { reportesService } from "../services/reportes.service";

export default function ReportesPage() {
  const permissions = usePermissions();
  const { isAdmin, isGerente } = permissions;
  const [isDownloading, setIsDownloading] = useState(false);

  // Seleccionar layout según rol
  const Layout = isAdmin()
    ? AdminLayout
    : isGerente()
    ? GerenteLayout
    : AdminLayout;

  const handleDescargarReporte = async () => {
    setIsDownloading(true);
    try {
      await reportesService.descargarReporteProductores();
      showToast.success("Reporte descargado exitosamente");
    } catch (error) {
      showToast.error("Error al descargar el reporte");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout title="Reportes">
      <PageContainer
        title="Reportes"
        description="Genera y descarga reportes del sistema"
      >
        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1">
                <h2 className="mb-2 text-lg font-semibold text-text-primary">
                  Lista de productores orgánicos
                </h2>
                <p className="mb-4 text-sm text-text-secondary">
                  Descarga la lista completa de todos los productores con datos
                  de superficies, cultivos y producción por gestión.
                </p>

                <Button
                  onClick={handleDescargarReporte}
                  disabled={isDownloading}
                  variant="primary"
                  className="inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? "Descargando..." : "Descargar Lista Excel"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </Layout>
  );
}
