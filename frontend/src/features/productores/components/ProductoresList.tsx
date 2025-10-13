/**
 * Tabla de productores con acciones
 * Muestra lista de productores con íconos GPS y acciones
 */

import { MapPin, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { DataTable, Badge, type DataTableColumn } from '@/shared/components/ui';
import { CATEGORIA_LABELS } from '../types/productor.types';
import type { Productor } from '../types/productor.types';

interface ProductoresListProps {
  productores: Productor[];
  loading?: boolean;
  onEdit?: (productor: Productor) => void;
  onDelete?: (productor: Productor) => void;
  onToggleActivo?: (productor: Productor) => void;
  onRowClick?: (productor: Productor) => void;
}

export function ProductoresList({
  productores,
  loading = false,
  onEdit,
  onDelete,
  onToggleActivo,
  onRowClick,
}: ProductoresListProps) {
  const columns: DataTableColumn<Productor>[] = [
    {
      key: 'codigo_productor',
      label: 'Código',
      sortable: true,
      render: (productor) => (
        <span className="font-mono text-sm font-medium">{productor.codigo_productor}</span>
      ),
    },
    {
      key: 'nombre_productor',
      label: 'Nombre Completo',
      sortable: true,
      render: (productor) => (
        <div>
          <p className="font-medium text-text-primary">{productor.nombre_productor}</p>
          {productor.ci_documento && (
            <p className="text-xs text-text-secondary">CI: {productor.ci_documento}</p>
          )}
        </div>
      ),
    },
    {
      key: 'nombre_comunidad',
      label: 'Comunidad',
      sortable: true,
      hiddenOnMobile: true,
      render: (productor) => (
        <div>
          <p className="text-sm text-text-primary">{productor.nombre_comunidad}</p>
          {productor.nombre_municipio && (
            <p className="text-xs text-text-secondary">{productor.nombre_municipio}</p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria_actual',
      label: 'Categoría',
      sortable: true,
      render: (productor) => {
        const variant =
          productor.categoria_actual === 'E'
            ? 'warning'
            : productor.categoria_actual === '0T'
            ? 'success'
            : 'info';

        return (
          <Badge variant={variant}>
            {productor.categoria_actual} - {CATEGORIA_LABELS[productor.categoria_actual]}
          </Badge>
        );
      },
    },
    {
      key: 'superficie_total_has',
      label: 'Superficie',
      sortable: true,
      hiddenOnMobile: true,
      render: (productor) => `${productor.superficie_total_has} ha`,
    },
    {
      key: 'coordenadas',
      label: 'GPS',
      render: (productor) => (
        <div className="flex items-center gap-1">
          {productor.coordenadas ? (
            <>
              <MapPin className="w-4 h-4 text-success" />
              <span className="text-xs text-success">Sí</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-text-disabled" />
              <span className="text-xs text-text-disabled">No</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (productor) => (
        <Badge variant={productor.activo ? 'success' : 'error'}>
          {productor.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  const actions = [
    ...(onEdit
      ? [
          {
            label: 'Editar',
            icon: Edit,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onToggleActivo
      ? [
          {
            label: (productor: Productor) => (productor.activo ? 'Desactivar' : 'Activar'),
            icon: (productor: Productor) => (productor.activo ? XCircle : CheckCircle),
            onClick: onToggleActivo,
            variant: (productor: Productor) => (productor.activo ? 'error' : 'success'),
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Eliminar',
            icon: Trash2,
            onClick: onDelete,
            variant: 'error' as const,
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={productores}
      actions={actions.length > 0 ? actions : undefined}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No hay productores registrados"
      rowKey="codigo_productor"
    />
  );
}
