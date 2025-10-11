interface SkeletonProps {
  variant?: "text" | "circle" | "rectangle";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

/**
 * Skeleton loading placeholder con animación shimmer
 * Mejores prácticas 2024-2025: Skeletons > Spinners
 * Dan mejor percepción de rendimiento
 */
export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-neutral-bg";

  const variantClasses = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rectangle: "rounded-md",
  };

  const style: React.CSSProperties = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : "100%",
    height: height
      ? typeof height === "number"
        ? `${height}px`
        : height
      : variant === "circle"
      ? width || "40px"
      : "auto",
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-busy="true"
      aria-label="Cargando..."
    />
  );
}

/**
 * Skeleton presets para casos comunes
 */
export const SkeletonPresets = {
  /**
   * Card completa con avatar, título y descripción
   */
  Card: () => (
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
  ),

  /**
   * Lista de items
   */
  List: ({ items = 3 }: { items?: number }) => (
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
  ),

  /**
   * Tabla responsiva
   */
  Table: ({ rows = 5 }: { rows?: number }) => (
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
  ),

  /**
   * Formulario
   */
  Form: () => (
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
  ),
};
