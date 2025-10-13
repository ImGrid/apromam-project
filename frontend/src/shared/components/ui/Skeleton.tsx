interface SkeletonProps {
  variant?: "text" | "circle" | "rectangle";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

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
