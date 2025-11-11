/**
 * FichaEditPage
 * Página para editar una ficha existente
 * Estructura IDÉNTICA a páginas con AdminLayout pero usa FichaLayout + FichaSidebar
 */

import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { FichaLayout } from "@/shared/components/layout/FichaLayout";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Alert";
import { FichaMultiStepForm, FichaSidebar, STEP_CONFIGS } from "../components/FichaMultiStepForm";
import { useFichaCompleta } from "../hooks/useFichaCompleta";
import { ROUTES } from "@/shared/config/routes.config";
import { isEditable } from "../components/Specialized";
import { useUpdateFicha } from "../hooks/useUpdateFicha";
import { useEnviarRevision } from "../hooks/useEnviarRevision";
import type { CreateFichaCompletaInput, UpdateFichaCompletaInput } from "../types/ficha.types";

export default function FichaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ficha, isLoading, error } = useFichaCompleta(id);
  const { updateCompleta, isLoading: isUpdating } = useUpdateFicha();
  const { enviarRevision, isLoading: isEnviando } = useEnviarRevision();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!id) return;

    console.log("[FichaEditPage] handleSubmit - data recibida:", data);

    // Los datos vienen PLANOS del FichaMultiStepForm (ya transformados)
    // Necesitamos re-estructurarlos al formato que espera el backend
    const updateData: UpdateFichaCompletaInput = {
      ficha: {
        fecha_inspeccion: data.fecha_inspeccion,
        inspector_interno: data.inspector_interno,
        persona_entrevistada: data.persona_entrevistada,
        categoria_gestion_anterior: data.categoria_gestion_anterior,
        comentarios_actividad_pecuaria: data.comentarios_actividad_pecuaria,
      },
      revision_documentacion: data.revision_documentacion,
      acciones_correctivas: data.acciones_correctivas,
      no_conformidades: data.no_conformidades,
      evaluacion_mitigacion: data.evaluacion_mitigacion,
      evaluacion_poscosecha: data.evaluacion_poscosecha,
      evaluacion_conocimiento: data.evaluacion_conocimiento_normas || data.evaluacion_conocimiento,
      actividades_pecuarias: data.actividades_pecuarias,
      parcelas_inspeccionadas: data.parcelas_inspeccionadas || [],
      detalles_cultivo: data.detalle_cultivos_parcelas || data.detalles_cultivo,
      cosecha_ventas: data.cosecha_ventas,
      planificacion_siembras: data.planificacion_siembras,
    };

    console.log("[FichaEditPage] updateData a enviar:", updateData);

    // 1. Primero actualizar el contenido
    await updateCompleta(id, updateData);

    // 2. Luego enviar a revisión automáticamente
    await enviarRevision(id, {});

    // 3. Navegar a la lista de fichas
    navigate(ROUTES.FICHAS);
  };

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const handleMobileSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Sidebar compartido
  const sidebar = (
    <FichaSidebar
      steps={STEP_CONFIGS}
      isMobileOpen={isMobileSidebarOpen}
      onMobileClose={handleMobileSidebarClose}
    />
  );

  // Loading state
  if (isLoading) {
    return (
      <FichaLayout title="Editar Ficha" sidebar={sidebar} onMobileMenuToggle={handleMobileMenuToggle}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin border-primary border-t-transparent"></div>
            <p className="text-text-secondary">Cargando ficha...</p>
          </div>
        </div>
      </FichaLayout>
    );
  }

  // Error state
  if (error || !ficha) {
    return (
      <FichaLayout title="Error" sidebar={sidebar} onMobileMenuToggle={handleMobileMenuToggle}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert
            type="error"
            message={
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Error al cargar la ficha</p>
                  <p className="mt-1 text-sm">{error || "Ficha no encontrada"}</p>
                </div>
              </div>
            }
          />
          <div className="mt-4">
            <Button onClick={() => navigate(ROUTES.FICHAS)}>
              <ArrowLeft className="w-4 h-4" />
              Volver a Fichas
            </Button>
          </div>
        </div>
      </FichaLayout>
    );
  }

  // Check if ficha is editable
  const canEdit = isEditable(ficha.ficha.estado_ficha);

  if (!canEdit) {
    return (
      <FichaLayout title="Ficha No Editable" sidebar={sidebar} onMobileMenuToggle={handleMobileMenuToggle}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert
            type="warning"
            message={
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    Esta ficha no puede ser editada
                  </p>
                  <p className="mt-1 text-sm">
                    El estado actual de la ficha (
                    <strong>{ficha.ficha.estado_ficha}</strong>) no permite
                    modificaciones.
                  </p>
                </div>
              </div>
            }
          />
          <div className="mt-4">
            <Button onClick={() => navigate(ROUTES.FICHAS_DETAIL(id!))}>
              <ArrowLeft className="w-4 h-4" />
              Ver Detalle
            </Button>
          </div>
        </div>
      </FichaLayout>
    );
  }

  // Transformar ficha completa para modo edit
  // IMPORTANTE: Separar parcelas_inspeccionadas de detalles_cultivo
  // El backend devuelve datos de parcela MEZCLADOS en cada detalle_cultivo
  // pero el frontend necesita dos arrays separados
  const initialData = {
    ...ficha,
    parcelas_inspeccionadas: Array.from(
      new Map(
        ficha.detalles_cultivo.map(detalle => [
          detalle.id_parcela,
          {
            id_parcela: detalle.id_parcela,
            rotacion: detalle.rotacion,
            utiliza_riego: detalle.utiliza_riego,
            tipo_barrera: detalle.tipo_barrera,
            insumos_organicos: detalle.insumos_organicos,
            latitud_sud: detalle.latitud_sud,
            longitud_oeste: detalle.longitud_oeste,
          }
        ])
      ).values()
    ),
  };

  return (
    <FichaLayout
      title={`Editar Ficha - ${ficha.ficha.codigo_productor} (${ficha.ficha.gestion})`}
      onMobileMenuToggle={handleMobileMenuToggle}
      sidebar={sidebar}
    >
      {/* Alerta si la ficha fue rechazada */}
      {ficha.ficha.resultado_certificacion === "rechazado" && (
        <div className="mb-4 p-4 sm:p-6">
          <Alert
            type="info"
            message={
              <div>
                <p className="text-sm font-medium mb-2">Esta ficha fue rechazada</p>
                <p className="text-sm">
                  <strong>Motivo:</strong>{" "}
                  {ficha.ficha.comentarios_evaluacion || "Sin motivo especificado"}
                </p>
              </div>
            }
          />
        </div>
      )}

      <FichaMultiStepForm
        initialData={initialData}
        onSubmit={handleSubmit}
        mode="edit"
        fichaId={id}
        isSubmitting={isUpdating || isEnviando}
      />
    </FichaLayout>
  );
}
