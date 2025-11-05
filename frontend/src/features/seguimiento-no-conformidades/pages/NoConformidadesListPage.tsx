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
import { Settings, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function NoConformidadesListPage() {
  const permissions = usePermissions();
  const [estadoFilter, setEstadoFilter] = useState<EstadoSeguimiento | "">("");
  const [selectedNC, setSelectedNC] = useState<NoConformidadEnriquecida | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComentarioModalOpen, setIsComentarioModalOpen] = useState(false);

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

  const handleOpenModal = (nc: NoConformidadEnriquecida) => {
    setSelectedNC(nc);
    setIsModalOpen(true);
  };

  const handleOpenComentario = (nc: NoConformidadEnriquecida) => {
    setSelectedNC(nc);
    setIsComentarioModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNC(null);
  };

  const handleCloseComentarioModal = () => {
    setIsComentarioModalOpen(false);
    setSelectedNC(null);
  };

  const handleSeguimientoSuccess = () => {
    refetch();
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
            icon={<Settings className="w-4 h-4" />}
            onClick={() => handleOpenModal(nc)}
            tooltip="Gestionar NC"
            variant="primary"
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

        {/* Modal Unificado */}
        <Modal
          isOpen={isModalOpen && selectedNC !== null}
          onClose={handleCloseModal}
          title="Gestionar No Conformidad"
          size="large"
        >
          {selectedNC && (
            <div className="space-y-6">
              {/* Información de la NC */}
              <div className="pb-3 border-b">
                <p className="text-sm text-gray-600">
                  <strong>Productor:</strong> {selectedNC.nombre_productor}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Descripción:</strong> {selectedNC.descripcion_no_conformidad}
                </p>
              </div>

              {/* Sección 1: Seguimiento */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Actualizar Seguimiento
                </h3>
                <SeguimientoForm
                  idNoConformidad={selectedNC.id_no_conformidad}
                  estadoActual={selectedNC.estado_seguimiento}
                  onSuccess={handleSeguimientoSuccess}
                />
              </div>

              {/* Sección 2: Archivos */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Gestión de Archivos
                </h3>
                <ArchivosSection idNoConformidad={selectedNC.id_no_conformidad} />
              </div>
            </div>
          )}
        </Modal>

        {/* Modal de Comentario */}
        <Modal
          isOpen={isComentarioModalOpen && selectedNC !== null}
          onClose={handleCloseComentarioModal}
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
