import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  SkeletonTable,
  SkeletonList,
} from "@/shared/components/ui/Skeleton/SkeletonPresets";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string;
  hiddenOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowKey: keyof T;
}

export function DataTable<T = Record<string, any>>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  rowKey,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Ordenamiento con type narrowing para unknown
  const sortedData = sortConfig
    ? [...data].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // Type guard: verificar que sean comparables
        if (aVal == null || bVal == null) return 0;

        // Convertir a string para comparación segura
        const aStr = String(aVal);
        const bStr = String(bVal);

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      })
    : data;

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  // Loading state - Ahora usando los componentes separados
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Desktop: Skeleton table */}
        <div className="hidden sm:block">
          <SkeletonTable rows={5} />
        </div>

        {/* Mobile: Skeleton cards */}
        <div className="sm:hidden">
          <SkeletonList items={5} />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-white border rounded-lg border-neutral-border">
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden overflow-hidden bg-white border rounded-lg sm:block border-neutral-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead className="bg-neutral-bg">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary"
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(String(column.key))}
                        className="flex items-center gap-1 transition-colors hover:text-primary touch-target"
                      >
                        {column.label}
                        {sortConfig?.key === column.key && (
                          <>
                            {sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-border">
              {sortedData.map((item) => (
                <tr
                  key={String(item[rowKey])}
                  onClick={() => onRowClick?.(item)}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-neutral-bg transition-colors"
                      : ""
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 text-sm text-text-primary whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="space-y-3 sm:hidden">
        {sortedData.map((item) => (
          <div
            key={String(item[rowKey])}
            onClick={() => onRowClick?.(item)}
            className={`
              p-4 bg-white border rounded-lg border-neutral-border
              ${
                onRowClick
                  ? "cursor-pointer active:bg-neutral-bg transition-colors"
                  : ""
              }
            `}
          >
            <div className="space-y-3">
              {columns
                .filter((col) => !col.hiddenOnMobile)
                .map((column) => (
                  <div
                    key={String(column.key)}
                    className="flex justify-between gap-4"
                  >
                    <span className="text-sm font-medium text-text-secondary">
                      {column.mobileLabel || column.label}:
                    </span>
                    <span className="text-sm text-right text-text-primary">
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? "")}
                    </span>
                  </div>
                ))}
            </div>

            {onRowClick && (
              <div className="flex justify-end pt-3 mt-3 border-t border-neutral-border">
                <button className="text-sm font-medium text-primary">
                  Ver detalles →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
