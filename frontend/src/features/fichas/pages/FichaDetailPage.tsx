/**
 * FichaDetailPage
 * Página para ver el detalle de una ficha en modo solo lectura
 * Incluye toda la información de la ficha y botones de acciones según el rol
 */

import { useParams, useNavigate } from "react-router-dom";
import { Edit, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Alert";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useFichaCompleta } from "../hooks/useFichaCompleta";
import { ROUTES } from "@/shared/config/routes.config";
import {
  isEditable,
  FichaWorkflowActions,
  FichaArchivosSection,
} from "../components/Specialized";
import type { ComplianceStatus } from "../types/ficha.types";

export default function FichaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { ficha, isLoading, error, refetch } = useFichaCompleta(id);

  // Determinar layout según rol
  const Layout = permissions.isAdmin()
    ? AdminLayout
    : permissions.isGerente()
    ? GerenteLayout
    : permissions.isTecnico()
    ? TecnicoLayout
    : AdminLayout;

  // Loading state
  if (isLoading) {
    return (
      <Layout title="Detalle de Ficha">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin border-primary border-t-transparent"></div>
              <p className="text-text-secondary">Cargando ficha...</p>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  // Error state
  if (error || !ficha) {
    return (
      <Layout title="Detalle de Ficha">
        <PageContainer>
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
              Volver a Fichas
            </Button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  // Helper para formatear hectáreas sin ceros innecesarios
  const formatHectares = (num: number): string => {
    return parseFloat(num.toFixed(4)).toString();
  };

  // Solo los técnicos pueden editar fichas (en estado borrador o rechazado)
  const canEdit = permissions.isTecnico() && isEditable(ficha.ficha.estado_ficha);

  // Técnicos pueden gestionar archivos en cualquier estado EXCEPTO cuando está aprobado
  const canManageArchivos =
    permissions.isTecnico() &&
    ficha.ficha.estado_ficha !== "aprobado";

  return (
    <Layout title="Detalle de Ficha">
      <PageContainer
        title="Ficha de Inspección"
        description={`${ficha.ficha.nombre_productor || ficha.ficha.codigo_productor} | Gestión: ${ficha.ficha.gestion} | Inspector: ${ficha.ficha.inspector_interno}`}
        actions={
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
            <Button variant="ghost" onClick={() => navigate(ROUTES.FICHAS)}>
              Volver
            </Button>
          </div>
        }
      >
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
              <div>
                <p className="text-sm font-medium">
                  Estado: {ficha.ficha.estado_ficha.toUpperCase()}
                </p>
                {ficha.ficha.comentarios_evaluacion && (
                  <p className="mt-1 text-sm">
                    {ficha.ficha.comentarios_evaluacion}
                  </p>
                )}
              </div>
            }
          />

          {/* Datos Generales */}
          <Card title="Datos Generales">
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
                value={new Date(ficha.ficha.fecha_inspeccion).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric"
                })}
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
          </Card>

          {/* Archivos Adjuntos */}
          <Card title="Archivos Adjuntos">
            <FichaArchivosSection
              idFicha={id!}
              archivos={ficha.archivos}
              canEdit={canManageArchivos}
              onArchivosChange={refetch}
            />
          </Card>

          {/* Revisión Documentación */}
          {ficha.revision_documentacion && (
            <Card title="Revisión de Documentación">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ComplianceField
                  label="Solicitud de Ingreso"
                  value={ficha.revision_documentacion.solicitud_ingreso}
                />
                <ComplianceField
                  label="Normas y Reglamentos"
                  value={ficha.revision_documentacion.normas_reglamentos}
                />
                <ComplianceField
                  label="Contrato de Producción"
                  value={ficha.revision_documentacion.contrato_produccion}
                />
                <ComplianceField
                  label="Croquis de Unidad"
                  value={ficha.revision_documentacion.croquis_unidad}
                />
                <ComplianceField
                  label="Diario de Campo"
                  value={ficha.revision_documentacion.diario_campo}
                />
                <ComplianceField
                  label="Registro de Cosecha"
                  value={ficha.revision_documentacion.registro_cosecha}
                />
                <ComplianceField
                  label="Recibo de Pago"
                  value={ficha.revision_documentacion.recibo_pago}
                />
              </div>
              {ficha.revision_documentacion.observaciones_documentacion && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-secondary">Observaciones</p>
                  <p className="mt-1 text-text-primary">
                    {ficha.revision_documentacion.observaciones_documentacion}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Acciones Correctivas */}
          {ficha.acciones_correctivas && ficha.acciones_correctivas.length > 0 && (
            <Card title={`Acciones Correctivas (${ficha.acciones_correctivas.length})`}>
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
            </Card>
          )}

          {/* Inspección de Parcelas (Sección 4) */}
          {(() => {
            // Agrupar cultivos por parcela
            const parcelasMap = new Map<string, typeof ficha.detalles_cultivo>();
            ficha.detalles_cultivo.forEach((detalle) => {
              const key = detalle.id_parcela;
              if (!parcelasMap.has(key)) {
                parcelasMap.set(key, []);
              }
              parcelasMap.get(key)!.push(detalle);
            });

            if (parcelasMap.size === 0) return null;

            return (
              <Card title={`Inspección de Parcelas (${parcelasMap.size})`}>
                <div className="space-y-6">
                  {Array.from(parcelasMap.entries()).map(([idParcela, cultivos], indexParcela) => {
                    const primerDetalle = cultivos[0];
                    return (
                      <div
                        key={idParcela}
                        className="p-5 border-2 rounded-lg border-primary/20 bg-primary/5"
                      >
                        {/* Header de Parcela */}
                        <h4 className="mb-4 text-lg font-bold text-primary">
                          Parcela {primerDetalle.numero_parcela !== undefined ? primerDetalle.numero_parcela : `ID: ${idParcela}`}
                        </h4>

                        {/* Datos de Inspección de la Parcela */}
                        <div className="p-4 mb-4 rounded-lg bg-white">
                          <p className="mb-3 text-sm font-semibold text-text-secondary">
                            DATOS DE INSPECCIÓN
                          </p>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {primerDetalle.rotacion !== undefined && (
                              <DetailField
                                label="Rotación de Cultivos"
                                value={primerDetalle.rotacion ? "Sí" : "No"}
                              />
                            )}
                            {primerDetalle.utiliza_riego !== undefined && (
                              <DetailField
                                label="Utiliza Riego"
                                value={primerDetalle.utiliza_riego ? "Sí" : "No"}
                              />
                            )}
                            {primerDetalle.tipo_barrera && (
                              <DetailField
                                label="Tipo de Barrera"
                                value={formatEnumValue(primerDetalle.tipo_barrera)}
                              />
                            )}
                            {primerDetalle.insumos_organicos && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailField
                                  label="Insumos Orgánicos"
                                  value={primerDetalle.insumos_organicos}
                                />
                              </div>
                            )}
                            {primerDetalle.latitud_sud && primerDetalle.longitud_oeste && (
                              <DetailField
                                label="Coordenadas GPS"
                                value={`${primerDetalle.latitud_sud.toFixed(6)}°S, ${primerDetalle.longitud_oeste.toFixed(6)}°O`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Cultivos en esta Parcela */}
                        <div>
                          <p className="mb-3 text-sm font-semibold text-text-secondary">
                            CULTIVOS ({cultivos.length})
                          </p>
                          <div className="space-y-3">
                            {cultivos.map((cultivo, indexCultivo) => (
                              <div
                                key={cultivo.id_detalle || indexCultivo}
                                className="p-4 border rounded-lg bg-white border-neutral-border"
                              >
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                  <DetailField
                                    label="Cultivo"
                                    value={cultivo.nombre_cultivo || `ID: ${cultivo.id_tipo_cultivo}`}
                                  />
                                  <DetailField
                                    label="Superficie (ha)"
                                    value={cultivo.superficie_ha.toString()}
                                  />
                                  {cultivo.situacion_actual && (
                                    <DetailField
                                      label="Situación Actual"
                                      value={cultivo.situacion_actual}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })()}

          {/* Evaluación de Mitigación */}
          {ficha.evaluacion_mitigacion && (
            <Card title="Evaluación de Mitigación de Riesgos">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ComplianceField
                  label="Práctica de Mitigación de Riesgos"
                  value={ficha.evaluacion_mitigacion.practica_mitigacion_riesgos}
                />
                <ComplianceField
                  label="Mitigación de Contaminación"
                  value={ficha.evaluacion_mitigacion.mitigacion_contaminacion}
                />
                <ComplianceField
                  label="Depósito de Herramientas"
                  value={ficha.evaluacion_mitigacion.deposito_herramientas}
                />
                <ComplianceField
                  label="Depósito de Insumos Orgánicos"
                  value={ficha.evaluacion_mitigacion.deposito_insumos_organicos}
                />
                <ComplianceField
                  label="Evita Quema de Residuos"
                  value={ficha.evaluacion_mitigacion.evita_quema_residuos}
                />
              </div>
              {ficha.evaluacion_mitigacion.comentarios_mitigacion && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-secondary">Comentarios</p>
                  <p className="mt-1 text-text-primary">
                    {ficha.evaluacion_mitigacion.comentarios_mitigacion}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Actividades Pecuarias */}
          {ficha.actividades_pecuarias && ficha.actividades_pecuarias.length > 0 && (
            <Card title={`Actividades Pecuarias (${ficha.actividades_pecuarias.length})`}>
              <div className="space-y-3">
                {ficha.actividades_pecuarias.map((actividad, index) => (
                  <div
                    key={actividad.id_actividad || index}
                    className="p-4 rounded-lg bg-neutral-bg"
                  >
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium text-text-secondary">Tipo de Ganado</p>
                        <p className="mt-1 font-medium text-text-primary">
                          {actividad.tipo_ganado}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-secondary">Cantidad</p>
                        <p className="mt-1 font-medium text-text-primary">
                          {actividad.cantidad}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-secondary">Uso de Guano</p>
                        <p className="mt-1 text-text-primary">
                          {actividad.uso_guano}
                        </p>
                      </div>
                    </div>
                    {actividad.sistema_manejo && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-text-secondary">Sistema de Manejo</p>
                        <p className="mt-1 text-sm text-text-primary">
                          {actividad.sistema_manejo}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {ficha.ficha.comentarios_actividad_pecuaria && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-secondary">Comentarios</p>
                  <p className="mt-1 text-text-primary">
                    {ficha.ficha.comentarios_actividad_pecuaria}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Manejo del Cultivo de Maní (Step 7) */}
          {(() => {
            // Filtrar solo cultivos que tengan datos de manejo
            const cultivosConManejo = ficha.detalles_cultivo.filter(
              (detalle) =>
                detalle.procedencia_semilla ||
                detalle.categoria_semilla ||
                detalle.tratamiento_semillas ||
                detalle.tipo_abonamiento ||
                detalle.metodo_aporque ||
                detalle.control_hierbas ||
                detalle.metodo_cosecha
            );

            if (cultivosConManejo.length === 0) return null;

            return (
              <Card title={`Manejo del Cultivo de Maní (${cultivosConManejo.length})`}>
                <div className="space-y-4">
                  {cultivosConManejo.map((detalle, index) => (
                    <div
                      key={detalle.id_detalle || index}
                      className="p-4 border rounded-lg border-neutral-border"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {detalle.procedencia_semilla && (
                          <DetailField
                            label="Procedencia de Semilla"
                            value={formatEnumValue(detalle.procedencia_semilla)}
                          />
                        )}
                        {detalle.categoria_semilla && (
                          <DetailField
                            label="Categoría de Semilla"
                            value={formatEnumValue(detalle.categoria_semilla)}
                          />
                        )}
                        {detalle.tratamiento_semillas && (
                          <DetailField
                            label="Tratamiento de Semillas"
                            value={formatEnumValue(detalle.tratamiento_semillas)}
                          />
                        )}
                        {detalle.tipo_abonamiento && (
                          <DetailField
                            label="Tipo de Abonamiento"
                            value={
                              detalle.tipo_abonamiento === "otro" && detalle.tipo_abonamiento_otro
                                ? detalle.tipo_abonamiento_otro
                                : formatEnumValue(detalle.tipo_abonamiento)
                            }
                          />
                        )}
                        {detalle.metodo_aporque && (
                          <DetailField
                            label="Método de Aporque"
                            value={
                              detalle.metodo_aporque === "otro" && detalle.metodo_aporque_otro
                                ? detalle.metodo_aporque_otro
                                : formatEnumValue(detalle.metodo_aporque)
                            }
                          />
                        )}
                        {detalle.control_hierbas && (
                          <DetailField
                            label="Control de Hierbas"
                            value={
                              detalle.control_hierbas === "otro" && detalle.control_hierbas_otro
                                ? detalle.control_hierbas_otro
                                : formatEnumValue(detalle.control_hierbas)
                            }
                          />
                        )}
                        {detalle.metodo_cosecha && (
                          <DetailField
                            label="Método de Cosecha"
                            value={
                              detalle.metodo_cosecha === "otro" && detalle.metodo_cosecha_otro
                                ? detalle.metodo_cosecha_otro
                                : formatEnumValue(detalle.metodo_cosecha)
                            }
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}

          {/* Cosecha y Ventas */}
          {ficha.cosecha_ventas && ficha.cosecha_ventas.length > 0 && (
            <Card title={`Cosecha y Ventas (${ficha.cosecha_ventas.length})`}>
              <div className="space-y-3">
                {ficha.cosecha_ventas.map((cosecha, index) => (
                  <div
                    key={cosecha.id_cosecha || index}
                    className="p-4 border rounded-lg border-neutral-border"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <DetailField
                        label="Tipo de Maní"
                        value={cosecha.tipo_mani}
                      />
                      <DetailField
                        label="Superficie Actual (ha)"
                        value={cosecha.superficie_actual_ha?.toString() || "N/A"}
                      />
                      <DetailField
                        label="Cosecha Estimada (qq)"
                        value={cosecha.cosecha_estimada_qq?.toString() || "N/A"}
                      />
                      <DetailField
                        label="Número de Parcelas"
                        value={cosecha.numero_parcelas?.toString() || "N/A"}
                      />
                      <DetailField
                        label="Destino Consumo (qq)"
                        value={cosecha.destino_consumo_qq?.toString() || "0"}
                      />
                      <DetailField
                        label="Destino Semilla (qq)"
                        value={cosecha.destino_semilla_qq?.toString() || "0"}
                      />
                      <DetailField
                        label="Destino Ventas (qq)"
                        value={cosecha.destino_ventas_qq?.toString() || "0"}
                      />
                    </div>
                    {cosecha.observaciones && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-text-secondary">Observaciones</p>
                        <p className="mt-1 text-sm text-text-primary">
                          {cosecha.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Evaluación Poscosecha */}
          {ficha.evaluacion_poscosecha && (
            <Card title="Evaluación de Poscosecha">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ComplianceField
                  label="Secado en Tendal"
                  value={ficha.evaluacion_poscosecha.secado_tendal}
                />
                <ComplianceField
                  label="Envases Limpios"
                  value={ficha.evaluacion_poscosecha.envases_limpios}
                />
                <ComplianceField
                  label="Almacén Protegido"
                  value={ficha.evaluacion_poscosecha.almacen_protegido}
                />
                <ComplianceField
                  label="Evidencia de Comercialización"
                  value={ficha.evaluacion_poscosecha.evidencia_comercializacion}
                />
              </div>
              {ficha.evaluacion_poscosecha.comentarios_poscosecha && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-secondary">Comentarios</p>
                  <p className="mt-1 text-text-primary">
                    {ficha.evaluacion_poscosecha.comentarios_poscosecha}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Evaluación de Conocimiento de Normas */}
          {ficha.evaluacion_conocimiento && (
            <Card title="Conocimiento de Normas">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ComplianceField
                  label="Conoce Normas Orgánicas"
                  value={ficha.evaluacion_conocimiento.conoce_normas_organicas}
                />
                <ComplianceField
                  label="Recibió Capacitación"
                  value={ficha.evaluacion_conocimiento.recibio_capacitacion}
                />
              </div>
              {ficha.evaluacion_conocimiento.comentarios_conocimiento && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-secondary">Comentarios</p>
                  <p className="mt-1 text-text-primary">
                    {ficha.evaluacion_conocimiento.comentarios_conocimiento}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* No Conformidades */}
          {ficha.no_conformidades && ficha.no_conformidades.length > 0 && (
            <Card title={`No Conformidades (${ficha.no_conformidades.length})`}>
              <div className="space-y-3">
                {ficha.no_conformidades.map((nc, index) => (
                  <div
                    key={nc.id_no_conformidad || index}
                    className="p-4 border-l-4 rounded-lg bg-error/5 border-error"
                  >
                    <p className="font-medium text-text-primary">
                      {nc.descripcion_no_conformidad}
                    </p>
                    {nc.accion_correctiva_propuesta && (
                      <p className="mt-2 text-sm text-text-secondary">
                        Acción correctiva: {nc.accion_correctiva_propuesta}
                      </p>
                    )}
                    {nc.fecha_limite_implementacion && (
                      <p className="mt-1 text-sm text-text-secondary">
                        Fecha límite: {new Date(nc.fecha_limite_implementacion).toLocaleDateString("es-BO")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Planificación de Siembras (Step 12) */}
          {ficha.planificacion_siembras && ficha.planificacion_siembras.length > 0 && (
            <Card title={`Planificación de Siembras - Próxima Gestión (${ficha.planificacion_siembras.length} parcelas)`}>
              <div className="space-y-4">
                {ficha.planificacion_siembras.map((plan, index) => (
                  <div
                    key={plan.id_planificacion || index}
                    className="p-5 border-2 rounded-lg border-primary/20 bg-primary/5"
                  >
                    <h4 className="mb-4 text-lg font-bold text-primary">
                      Parcela {plan.numero_parcela !== undefined ? plan.numero_parcela : index + 1}
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <DetailField
                        label="Área Planificada (ha)"
                        value={formatHectares(plan.area_parcela_planificada_ha)}
                      />
                      {plan.superficie_actual_ha !== undefined && (
                        <DetailField
                          label="Superficie Actual (ha)"
                          value={formatHectares(plan.superficie_actual_ha)}
                        />
                      )}
                    </div>

                    <div className="p-4 mt-4 rounded-lg bg-white">
                      <p className="mb-3 text-sm font-semibold text-text-secondary">
                        CULTIVOS PLANIFICADOS
                      </p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        <DetailField label="Maní (ha)" value={formatHectares(plan.mani_ha)} />
                        <DetailField label="Maíz (ha)" value={formatHectares(plan.maiz_ha)} />
                        <DetailField label="Papa (ha)" value={formatHectares(plan.papa_ha)} />
                        <DetailField label="Ají (ha)" value={formatHectares(plan.aji_ha)} />
                        <DetailField label="Leguminosas (ha)" value={formatHectares(plan.leguminosas_ha)} />
                        <DetailField label="Otros (ha)" value={formatHectares(plan.otros_cultivos_ha)} />
                        <DetailField label="Descanso (ha)" value={formatHectares(plan.descanso_ha)} />
                      </div>
                      {plan.otros_cultivos_detalle && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-text-secondary">
                            Detalle de Otros Cultivos
                          </p>
                          <p className="mt-1 text-text-primary">
                            {plan.otros_cultivos_detalle}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 mt-4 border rounded-lg bg-blue-50 border-blue-200">
                      <p className="text-sm font-medium text-neutral-900">Resumen</p>
                      <div className="mt-2 text-sm text-neutral-700">
                        <p>
                          Total cultivos: <strong>{formatHectares(
                            plan.mani_ha +
                            plan.maiz_ha +
                            plan.papa_ha +
                            plan.aji_ha +
                            plan.leguminosas_ha +
                            plan.otros_cultivos_ha
                          )} ha</strong>
                        </p>
                        <p>
                          Porcentaje de uso: <strong>
                            {plan.area_parcela_planificada_ha > 0
                              ? ((
                                  (plan.mani_ha +
                                    plan.maiz_ha +
                                    plan.papa_ha +
                                    plan.aji_ha +
                                    plan.leguminosas_ha +
                                    plan.otros_cultivos_ha) /
                                  plan.area_parcela_planificada_ha
                                ) * 100).toFixed(1)
                              : "0.0"}%
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Workflow Actions */}
          <Card title="Acciones de Workflow">
            <FichaWorkflowActions
              idFicha={id!}
              estadoFicha={ficha.ficha.estado_ficha}
              onSuccess={refetch}
            />
          </Card>
        </div>
      </PageContainer>
    </Layout>
  );
}

// Helper component para mostrar campos detalle
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-text-primary">{value}</p>
    </div>
  );
}

// Helper component para mostrar campos de compliance con badge
function ComplianceField({ label, value }: { label: string; value: ComplianceStatus }) {
  const getComplianceColor = (status: ComplianceStatus) => {
    switch (status) {
      case "cumple":
        return "bg-success/10 text-success";
      case "parcial":
        return "bg-warning/10 text-warning";
      case "no_cumple":
        return "bg-error/10 text-error";
      case "no_aplica":
        return "bg-neutral-bg text-text-secondary";
      default:
        return "bg-neutral-bg text-text-secondary";
    }
  };

  const getComplianceLabel = (status: ComplianceStatus) => {
    switch (status) {
      case "cumple":
        return "Cumple";
      case "parcial":
        return "Parcial";
      case "no_cumple":
        return "No Cumple";
      case "no_aplica":
        return "No Aplica";
      default:
        return status;
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <span
        className={`inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full ${getComplianceColor(value)}`}
      >
        {getComplianceLabel(value)}
      </span>
    </div>
  );
}

// Helper function para formatear valores enum de manera legible
function formatEnumValue(value: string): string {
  if (!value) return "N/A";

  // Convertir snake_case a Title Case
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
