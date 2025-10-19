/**
 * Tabla de productores con acciones
 * Muestra lista de productores con íconos GPS y acciones
 */

import { MapPin, Edit, Trash2 } from 'lucide-react';
import { DataTable, Badge, IconButton, type DataTableColumn } from '@/shared/components/ui';
import { CATEGORIA_LABELS } from '../types/productor.types';
import type { Productor } from '../types/productor.types';

interface ProductoresListProps {
  productores: Productor[];
  loading?: boolean;
  onEdit?: (productor: Productor) => void;
  onDelete?: (productor: Productor) => void;
}

export function ProductoresList({
  productores,
  loading = false,
  onEdit,
  onDelete,
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
      key: 'nombre_organizacion',
      label: 'Organización',
      sortable: true,
      render: (productor) => (
        <div>
          {productor.abreviatura_organizacion ? (
            <>
              <p className="text-sm font-medium text-text-primary">{productor.abreviatura_organizacion}</p>
              {productor.nombre_organizacion && (
                <p className="text-xs text-text-secondary">{productor.nombre_organizacion}</p>
              )}
            </>
          ) : (
            <span className="text-xs text-text-disabled">Sin organización</span>
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
    {
      key: 'acciones',
      label: 'Acciones',
      render: (productor) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <IconButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Editar productor"
              variant="primary"
              onClick={() => onEdit(productor)}
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              tooltip="Eliminar productor"
              variant="danger"
              onClick={() => onDelete(productor)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={productores}
      loading={loading}
      emptyMessage="No hay productores registrados"
      rowKey="codigo_productor"
    />
  );
}
