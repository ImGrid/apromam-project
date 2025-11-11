// Página de detalle de No Conformidad (PÁGINA CORE)
// Muestra toda la información, formulario de seguimiento y archivos
// Diseño compacto según research de UX

import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  SeguimientoForm,
  ArchivosSection,
  EstadoSeguimientoBadge,
} from "../components";
import { useNoConformidadById } from "../hooks";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function NoConformidadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: nc, isLoading, refetch } = useNoConformidadById(id || "");

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!nc) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card compact>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-disabled mx-auto mb-3" />
            <p className="text-text-secondary">No Conformidad no encontrada</p>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(-1)}
              className="mt-4"
            >
              Volver
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header con navegación */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              Seguimiento de No Conformidad
            </h1>
            <p className="text-sm text-text-secondary">
              {nc.codigo_productor} - {nc.nombre_productor}
            </p>
          </div>
        </div>
        <EstadoSeguimientoBadge estado={nc.estado_seguimiento} size="medium" />
      </div>

      {/* Layout principal: 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna principal (izquierda) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Información de la NC */}
          <Card compact title="Detalles de la No Conformidad">
            <div className="space-y-4">
              {/* Descripción */}
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase mb-1">
                  Descripción del Incumplimiento
                </h3>
                <p className="text-sm text-neutral-900 whitespace-pre-wrap">
                  {nc.descripcion_no_conformidad}
                </p>
              </div>

              {/* Acción correctiva propuesta */}
              {nc.accion_correctiva_propuesta && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase mb-1">
                    Acción Correctiva Propuesta
                  </h3>
                  <p className="text-sm text-neutral-900 whitespace-pre-wrap">
                    {nc.accion_correctiva_propuesta}
                  </p>
                </div>
              )}

              {/* Metadata en grid compacto */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                {nc.gestion && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-disabled mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500">Gestión</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {nc.gestion}
                      </p>
                    </div>
                  </div>
                )}

                {nc.fecha_limite_implementacion && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-disabled mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500">Fecha Límite</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {format(
                          parseISO(nc.fecha_limite_implementacion),
                          "dd MMM yyyy",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {nc.nombre_comunidad && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-disabled mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500">Comunidad</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {nc.nombre_comunidad}
                      </p>
                    </div>
                  </div>
                )}

                {nc.created_at && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-disabled mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500">Fecha de Registro</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {format(parseISO(nc.created_at), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Último seguimiento */}
              {nc.fecha_seguimiento && (
                <div className="pt-2 border-t border-neutral-200">
                  <div className="flex items-start gap-2 mb-1">
                    <User className="w-4 h-4 text-disabled mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500">
                        Último seguimiento:{" "}
                        {format(parseISO(nc.fecha_seguimiento), "dd MMM yyyy HH:mm", {
                          locale: es,
                        })}
                      </p>
                      {nc.nombre_usuario_seguimiento && (
                        <p className="text-xs text-text-secondary">
                          Por: {nc.nombre_usuario_seguimiento}
                        </p>
                      )}
                    </div>
                  </div>
                  {nc.comentario_seguimiento && (
                    <p className="text-sm text-neutral-700 bg-neutral-50 rounded p-2 mt-2">
                      {nc.comentario_seguimiento}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Sección de archivos */}
          <ArchivosSection idNoConformidad={nc.id_no_conformidad} />
        </div>

        {/* Columna derecha (sidebar) */}
        <div className="space-y-4">
          {/* Formulario de seguimiento - COMPONENTE CORE */}
          <Card compact title="Actualizar Seguimiento">
            <SeguimientoForm
              idNoConformidad={nc.id_no_conformidad}
              estadoActual={nc.estado_seguimiento}
              onSuccess={() => {
                refetch();
              }}
            />
          </Card>

          {/* Info rápida del productor */}
          <Card compact title="Productor">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Código</p>
                <p className="font-medium text-neutral-900">{nc.codigo_productor}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Nombre</p>
                <p className="font-medium text-neutral-900">{nc.nombre_productor}</p>
              </div>
              {nc.nombre_comunidad && (
                <div>
                  <p className="text-xs text-neutral-500">Comunidad</p>
                  <p className="font-medium text-neutral-900">{nc.nombre_comunidad}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
