import { useState } from "react";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Card } from "@/shared/components/ui/Card";
import { DataTable } from "@/shared/components/ui/DataTable";
import { IconButton } from "@/shared/components/ui/IconButton";
import { Modal } from "@/shared/components/ui/Modal";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useNoConformidades } from "../hooks";
import { EstadoSeguimientoBadge, SeguimientoForm, ArchivosSection, EstadisticasWidget } from "../components";
import type { NoConformidadEnriquecida, EstadoSeguimiento } from "../types";
import type { DataTableColumn } from "@/shared/components/ui/DataTable";
import { Edit, Upload, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function NoConformidadesListPage() {
  const permissions = usePermissions();
  const [estadoFilter, setEstadoFilter] = useState<EstadoSeguimiento | "">("");
  const [selectedNC, setSelectedNC] = useState<NoConformidadEnriquecida | null>(null);
  const [modalType, setModalType] = useState<"seguimiento" | "archivos" | "comentario" | null>(null);

  const { noConformidades, isLoading, refetch } = useNoConformidades(
    estadoFilter ? { estado_seguimiento: estadoFilter } : undefined
  );

  const Layout = permissions.isAdmin()
    ? AdminLayout
    : permissions.isGerente()
    ? GerenteLayout
    : permissions.isTecnico()
    ? TecnicoLayout
    : AdminLayout;

  const handleOpenSeguimiento = (nc: NoConformidadEnriquecida) => {
    setSelectedNC(nc);
    setModalType("seguimiento");
  };

  const handleOpenArchivos = (nc: NoConformidadEnriquecida) => {
    setSelectedNC(nc);
    setModalType("archivos");
  };

  const handleOpenComentario = (nc: NoConformidadEnriquecida) => {
    setSelectedNC(nc);
    setModalType("comentario");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedNC(null);
  };

  const handleSeguimientoSuccess = () => {
    refetch();
    handleCloseModal();
  };

  const columns: DataTableColumn<NoConformidadEnriquecida>[] = [
    {
      key: "codigo_productor",
      label: "Productor",
      render: (nc) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{nc.nombre_productor}</div>
          <div className="text-xs text-gray-500">{nc.codigo_productor}</div>
        </div>
      ),
    },
    {
      key: "descripcion_no_conformidad",
      label: "Descripción",
      render: (nc) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900 line-clamp-4">{nc.descripcion_no_conformidad}</p>
        </div>
      ),
    },
    {
      key: "accion_correctiva_propuesta",
      label: "Acción Correctiva",
      render: (nc) => (
        <div className="max-w-md">
          {nc.accion_correctiva_propuesta ? (
            <p className="text-sm text-gray-900 line-clamp-4">{nc.accion_correctiva_propuesta}</p>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "estado_seguimiento",
      label: "Estado",
      render: (nc) => (
        <EstadoSeguimientoBadge estado={nc.estado_seguimiento} />
      ),
    },
    {
      key: "fecha_limite_implementacion",
      label: "Fecha Límite",
      render: (nc) =>
        nc.fecha_limite_implementacion ? (
          <span className="text-sm text-gray-900">
            {format(parseISO(nc.fecha_limite_implementacion), "dd/MM/yyyy", { locale: es })}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    {
      key: "comentario_seguimiento",
      label: "Comentario",
      render: (nc) => (
        <div className="flex items-center justify-center">
          {nc.comentario_seguimiento ? (
            <IconButton
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={() => handleOpenComentario(nc)}
              tooltip="Ver comentario"
              variant="primary"
            />
          ) : (
            <MessageSquare className="w-4 h-4 text-gray-300" />
          )}
        </div>
      ),
    },
    {
      key: "id_no_conformidad",
      label: "Acciones",
      render: (nc) => (
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleOpenSeguimiento(nc)}
            tooltip="Actualizar seguimiento"
            variant="primary"
          />
          <IconButton
            icon={<Upload className="w-4 h-4" />}
            onClick={() => handleOpenArchivos(nc)}
            tooltip="Gestionar archivos"
            variant="neutral"
          />
        </div>
      ),
    },
  ];

  return (
    <Layout title="No Conformidades">
      <PageContainer title="No Conformidades">
        <div className="space-y-4">
          {/* Estadísticas */}
          <EstadisticasWidget />

          <Card compact>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Filtrar por estado:
              </label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as EstadoSeguimiento | "")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="seguimiento">En Seguimiento</option>
                <option value="corregido">Corregido</option>
              </select>
            </div>

            <DataTable
              columns={columns}
              data={noConformidades}
              loading={isLoading}
              emptyMessage="No se encontraron no conformidades"
              rowKey="id_no_conformidad"
            />
          </Card>
        </div>

        {/* Modal de Seguimiento */}
        <Modal
          isOpen={modalType === "seguimiento" && selectedNC !== null}
          onClose={handleCloseModal}
          title="Actualizar Seguimiento"
          size="medium"
        >
          {selectedNC && (
            <div className="space-y-3">
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600">
                  <strong>Productor:</strong> {selectedNC.nombre_productor}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Descripción:</strong> {selectedNC.descripcion_no_conformidad}
                </p>
              </div>
              <SeguimientoForm
                idNoConformidad={selectedNC.id_no_conformidad}
                estadoActual={selectedNC.estado_seguimiento}
                onSuccess={handleSeguimientoSuccess}
              />
            </div>
          )}
        </Modal>

        {/* Modal de Archivos */}
        <Modal
          isOpen={modalType === "archivos" && selectedNC !== null}
          onClose={handleCloseModal}
          title="Gestionar Archivos"
          size="large"
        >
          {selectedNC && (
            <div className="space-y-3">
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600">
                  <strong>Productor:</strong> {selectedNC.nombre_productor}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Descripción:</strong> {selectedNC.descripcion_no_conformidad}
                </p>
              </div>
              <ArchivosSection idNoConformidad={selectedNC.id_no_conformidad} />
            </div>
          )}
        </Modal>

        {/* Modal de Comentario */}
        <Modal
          isOpen={modalType === "comentario" && selectedNC !== null}
          onClose={handleCloseModal}
          title="Comentario de Seguimiento"
          size="medium"
        >
          {selectedNC && (
            <div className="space-y-4">
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600">
                  <strong>Productor:</strong> {selectedNC.nombre_productor}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Descripción:</strong> {selectedNC.descripcion_no_conformidad}
                </p>
              </div>

              <div className="space-y-3">
                {/* Metadatos del comentario */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Registrado por:</span>
                    <span>{selectedNC.nombre_usuario_seguimiento || "Usuario desconocido"}</span>
                  </div>
                  {selectedNC.fecha_seguimiento && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Fecha:</span>
                      <span>
                        {format(parseISO(selectedNC.fecha_seguimiento), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comentario completo */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedNC.comentario_seguimiento}
                  </p>
                </div>

                {/* Estado actual */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm font-medium text-gray-600">Estado actual:</span>
                  <EstadoSeguimientoBadge estado={selectedNC.estado_seguimiento} />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </PageContainer>
    </Layout>
  );
}
