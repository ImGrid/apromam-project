import { Skeleton } from "../Skeleton";

export const SkeletonCard = () => (
  <div className="p-6 space-y-4 bg-white border rounded-lg border-neutral-border">
    <div className="flex items-center gap-4">
      <Skeleton variant="circle" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
    </div>
    <Skeleton count={3} />
  </div>
);

/**
 * Lista de items
 */
interface SkeletonListProps {
  items?: number;
}

export const SkeletonList = ({ items = 3 }: SkeletonListProps) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Tabla responsiva
 */
interface SkeletonTableProps {
  rows?: number;
}

export const SkeletonTable = ({ rows = 5 }: SkeletonTableProps) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="grid grid-cols-4 gap-4">
      <Skeleton height={32} />
      <Skeleton height={32} />
      <Skeleton height={32} />
      <Skeleton height={32} />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    ))}
  </div>
);

/**
 * Formulario
 */
export const SkeletonForm = () => (
  <div className="space-y-4">
    <div>
      <Skeleton width="30%" height={20} className="mb-2" />
      <Skeleton height={48} />
    </div>
    <div>
      <Skeleton width="40%" height={20} className="mb-2" />
      <Skeleton height={48} />
    </div>
    <div>
      <Skeleton width="35%" height={20} className="mb-2" />
      <Skeleton height={96} />
    </div>
    <Skeleton height={48} width="150px" />
  </div>
);
