/**
 * FichaDetailPage
 * Página para ver el detalle de una ficha en modo solo lectura
 * Incluye toda la información de la ficha y botones de acciones según el rol
 */

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Alert";
import { useFichaCompleta } from "../hooks/useFichaCompleta";
import { ROUTES } from "@/shared/config/routes.config";
import {
  isEditable,
  EstadoFichaBadge,
  FichaWorkflowActions,
  FichaArchivosSection,
} from "../components/Specialized";
import type { EstadoFicha } from "../types/ficha.types";

export default function FichaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ficha, isLoading, error, refetch } = useFichaCompleta(id);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin border-primary border-t-transparent"></div>
          <p className="text-text-secondary">Cargando ficha...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !ficha) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
      </div>
    );
  }

  const canEdit = isEditable(ficha.ficha.estado_ficha);

  const getEstadoIcon = (estado: EstadoFicha) => {
    switch (estado) {
      case "borrador":
        return <FileText className="w-5 h-5" />;
      case "revision":
        return <Clock className="w-5 h-5" />;
      case "aprobado":
        return <CheckCircle className="w-5 h-5" />;
      case "rechazado":
        return <XCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <div className="bg-white border-b border-neutral-border">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.FICHAS)}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary">
                    Ficha de Inspección
                  </h1>
                  <EstadoFichaBadge estado={ficha.ficha.estado_ficha} />
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  {ficha.ficha.nombre_productor || ficha.ficha.codigo_productor}{" "}
                  | Gestión: {ficha.ficha.gestion} | Inspector:{" "}
                  {ficha.ficha.inspector_interno}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.FICHAS_EDIT(id!))}
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Estado Alert */}
          <Alert
            type={
              ficha.ficha.estado_ficha === "aprobado"
                ? "success"
                : ficha.ficha.estado_ficha === "rechazado"
                ? "error"
                : "info"
            }
            message={
              <div className="flex items-start">
                {getEstadoIcon(ficha.ficha.estado_ficha)}
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    Estado: {ficha.ficha.estado_ficha.toUpperCase()}
                  </p>
                  {ficha.ficha.comentarios_evaluacion && (
                    <p className="mt-1 text-sm">
                      {ficha.ficha.comentarios_evaluacion}
                    </p>
                  )}
                </div>
              </div>
            }
          />

          {/* Datos Generales */}
          <div className="p-6 bg-white border rounded-lg border-neutral-border">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              Datos Generales
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailField
                label="Código Productor"
                value={ficha.ficha.codigo_productor}
              />
              <DetailField
                label="Gestión"
                value={ficha.ficha.gestion.toString()}
              />
              <DetailField
                label="Fecha de Inspección"
                value={new Date(ficha.ficha.fecha_inspeccion).toLocaleDateString()}
              />
              <DetailField
                label="Inspector Interno"
                value={ficha.ficha.inspector_interno}
              />
              {ficha.ficha.persona_entrevistada && (
                <DetailField
                  label="Persona Entrevistada"
                  value={ficha.ficha.persona_entrevistada}
                />
              )}
              {ficha.ficha.categoria_gestion_anterior && (
                <DetailField
                  label="Categoría Gestión Anterior"
                  value={ficha.ficha.categoria_gestion_anterior}
                />
              )}
            </div>
          </div>

          {/* Revisión Documentación */}
          {ficha.revision_documentacion && (
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Revisión de Documentación
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailField
                  label="Solicitud de Ingreso"
                  value={ficha.revision_documentacion.solicitud_ingreso}
                />
                <DetailField
                  label="Normas y Reglamentos"
                  value={ficha.revision_documentacion.normas_reglamentos}
                />
                <DetailField
                  label="Contrato de Producción"
                  value={ficha.revision_documentacion.contrato_produccion}
                />
                <DetailField
                  label="Croquis de Unidad"
                  value={ficha.revision_documentacion.croquis_unidad}
                />
              </div>
            </div>
          )}

          {/* Acciones Correctivas */}
          {ficha.acciones_correctivas && ficha.acciones_correctivas.length > 0 && (
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Acciones Correctivas ({ficha.acciones_correctivas.length})
              </h2>
              <div className="space-y-3">
                {ficha.acciones_correctivas.map((accion, index) => (
                  <div
                    key={accion.id_accion || index}
                    className="p-4 rounded-lg bg-neutral-bg"
                  >
                    <p className="font-medium text-text-primary">
                      {accion.numero_accion}. {accion.descripcion_accion}
                    </p>
                    {accion.implementacion_descripcion && (
                      <p className="mt-1 text-sm text-text-secondary">
                        Implementación: {accion.implementacion_descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalles de Cultivo */}
          {ficha.detalles_cultivo && ficha.detalles_cultivo.length > 0 && (
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Inspección de Parcelas ({ficha.detalles_cultivo.length})
              </h2>
              <div className="space-y-3">
                {ficha.detalles_cultivo.map((detalle, index) => (
                  <div
                    key={detalle.id_detalle || index}
                    className="p-4 rounded-lg bg-neutral-bg"
                  >
                    <p className="font-medium text-text-primary">
                      Parcela: {detalle.id_parcela} | Cultivo:{" "}
                      {detalle.nombre_cultivo || `ID ${detalle.id_tipo_cultivo}`}
                    </p>
                    {detalle.procedencia_semilla && (
                      <p className="mt-1 text-sm text-text-secondary">
                        Semilla: {detalle.procedencia_semilla}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actividades Pecuarias */}
          {ficha.actividades_pecuarias &&
            ficha.actividades_pecuarias.length > 0 && (
              <div className="p-6 bg-white border rounded-lg border-neutral-border">
                <h2 className="mb-4 text-lg font-semibold text-text-primary">
                  Actividades Pecuarias ({ficha.actividades_pecuarias.length})
                </h2>
                <div className="space-y-3">
                  {ficha.actividades_pecuarias.map((actividad, index) => (
                    <div
                      key={actividad.id_actividad || index}
                      className="p-4 rounded-lg bg-neutral-bg"
                    >
                      <p className="font-medium text-text-primary">
                        {actividad.tipo_ganado} - Cantidad: {actividad.cantidad}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Uso de guano: {actividad.uso_guano}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Workflow Actions */}
          <div className="p-6 bg-white border rounded-lg border-neutral-border">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              Acciones de Workflow
            </h2>
            <FichaWorkflowActions
              idFicha={id!}
              estadoFicha={ficha.ficha.estado_ficha}
              onSuccess={refetch}
            />
          </div>

          {/* Archivos Adjuntos */}
          <div className="p-6 bg-white border rounded-lg border-neutral-border">
            <FichaArchivosSection
              idFicha={id!}
              archivos={ficha.archivos}
              canEdit={canEdit}
              onArchivosChange={refetch}
            />
          </div>

          {/* Recomendaciones */}
          {ficha.ficha.recomendaciones && (
            <div className="p-6 bg-white border rounded-lg border-neutral-border">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Recomendaciones
              </h2>
              <p className="text-text-secondary whitespace-pre-wrap">
                {ficha.ficha.recomendaciones}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying field details
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-text-primary">{value}</p>
    </div>
  );
}
