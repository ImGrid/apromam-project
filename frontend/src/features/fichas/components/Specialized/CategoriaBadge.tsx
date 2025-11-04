/**
 * CategoriaBadge
 * Badge para mostrar la categoría de gestión de un productor
 * E (Ecológico) | T2 (Segundo año transición) | T1 (Primer año) | T0 (Año cero)
 */

import { Badge } from "@/shared/components/ui/Badge";

export type CategoriaGestion = "E" | "T2" | "T1" | "T0";

interface CategoriaBadgeProps {
  categoria: CategoriaGestion;
  showLabel?: boolean;
  size?: "small" | "medium";
}

const CATEGORIA_CONFIG: Record<
  CategoriaGestion,
  {
    label: string;
    fullLabel: string;
    variant: "success" | "info" | "warning" | "neutral";
    description: string;
  }
> = {
  E: {
    label: "E",
    fullLabel: "Ecológico",
    variant: "success",
    description: "Certificación orgánica completa",
  },
  "T2": {
    label: "T2",
    fullLabel: "2° Transición",
    variant: "info",
    description: "Segundo año de transición",
  },
  "T1": {
    label: "T1",
    fullLabel: "1° Transición",
    variant: "warning",
    description: "Primer año de transición",
  },
  "T0": {
    label: "T0",
    fullLabel: "Año Cero",
    variant: "neutral",
    description: "Año cero - inicio del proceso",
  },
};

export function CategoriaBadge({
  categoria,
  showLabel = false,
  size = "medium",
}: CategoriaBadgeProps) {
  const config = CATEGORIA_CONFIG[categoria];

  return (
    <span title={config.description}>
      <Badge variant={config.variant} size={size}>
        {showLabel ? config.fullLabel : config.label}
      </Badge>
    </span>
  );
}

/**
 * Componente con descripción completa
 */
interface CategoriaCardProps {
  categoria: CategoriaGestion;
  className?: string;
}

export function CategoriaCard({ categoria, className = "" }: CategoriaCardProps) {
  const config = CATEGORIA_CONFIG[categoria];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${className}`}
    >
      <CategoriaBadge categoria={categoria} />
      <div>
        <p className="text-sm font-medium text-text-primary">
          {config.fullLabel}
        </p>
        <p className="text-xs text-text-secondary">{config.description}</p>
      </div>
    </div>
  );
}

/**
 * Helper para obtener la categoría siguiente en el ciclo
 */
export function getNextCategoria(
  currentCategoria: CategoriaGestion
): CategoriaGestion | null {
  const cycle: CategoriaGestion[] = ["T0", "T1", "T2", "E"];
  const currentIndex = cycle.indexOf(currentCategoria);

  if (currentIndex === -1 || currentIndex === cycle.length - 1) {
    return null; // Ya está en E (ecológico)
  }

  return cycle[currentIndex + 1];
}

/**
 * Helper para obtener el label de la categoría
 */
export function getCategoriaLabel(categoria: CategoriaGestion): string {
  return CATEGORIA_CONFIG[categoria].fullLabel;
}
