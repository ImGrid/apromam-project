/**
 * ComplianceRadioGroup
 * Componente de radio buttons para indicar cumplimiento
 * Opciones: Cumple | Parcial | No Cumple | No Aplica
 */

import { forwardRef } from "react";
import { CheckCircle, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

interface ComplianceOption {
  value: ComplianceStatus;
  label: string;
  icon: typeof CheckCircle;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const COMPLIANCE_OPTIONS: ComplianceOption[] = [
  {
    value: "cumple",
    label: "Cumple",
    icon: CheckCircle,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    borderClass: "border-success",
  },
  {
    value: "parcial",
    label: "Parcial",
    icon: AlertTriangle,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning",
  },
  {
    value: "no_cumple",
    label: "No Cumple",
    icon: XCircle,
    colorClass: "text-error",
    bgClass: "bg-error/10",
    borderClass: "border-error",
  },
  {
    value: "no_aplica",
    label: "No Aplica",
    icon: MinusCircle,
    colorClass: "text-text-secondary",
    bgClass: "bg-neutral-bg",
    borderClass: "border-neutral-border",
  },
];

interface ComplianceRadioGroupProps {
  name: string;
  value?: ComplianceStatus;
  onChange: (value: ComplianceStatus) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helperText?: string;
  showParcial?: boolean; // Controla si se muestra la opción "Parcial"
  showNoAplica?: boolean; // Controla si se muestra la opción "No Aplica"
}

export const ComplianceRadioGroup = forwardRef<
  HTMLDivElement,
  ComplianceRadioGroupProps
>(
  (
    {
      name,
      value,
      onChange,
      label,
      required = false,
      error,
      disabled = false,
      helperText,
      showParcial = true,
      showNoAplica = true,
    },
    ref
  ) => {
    // Filtrar opciones según showParcial y showNoAplica
    let availableOptions = COMPLIANCE_OPTIONS;

    if (!showParcial) {
      availableOptions = availableOptions.filter((opt) => opt.value !== "parcial");
    }

    if (!showNoAplica) {
      availableOptions = availableOptions.filter((opt) => opt.value !== "no_aplica");
    }

    // Calcular clases del grid según número de opciones
    const optionsCount = availableOptions.length;
    const gridColsClass = optionsCount === 2
      ? "grid-cols-2"
      : optionsCount === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

    return (
      <div ref={ref} className="space-y-3">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}

        {/* Radio buttons grid */}
        <div
          className={`grid ${gridColsClass} gap-3`}
          role="radiogroup"
          aria-label={label}
        >
          {availableOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <label
                key={option.value}
                className={`
                  relative flex items-center justify-center gap-2 p-3
                  border-2 rounded-lg cursor-pointer transition-all
                  min-h-[44px] touch-target
                  ${
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-sm"
                  }
                  ${
                    isSelected
                      ? `${option.bgClass} ${option.borderClass} shadow-sm`
                      : "bg-white border-neutral-border hover:border-neutral-300"
                  }
                `}
              >
                {/* Hidden native radio */}
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value as ComplianceStatus)}
                  disabled={disabled}
                  className="sr-only peer"
                />

                {/* Icon */}
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isSelected ? option.colorClass : "text-text-secondary"
                  }`}
                />

                {/* Label */}
                <span
                  className={`text-sm font-medium ${
                    isSelected ? option.colorClass : "text-text-primary"
                  }`}
                >
                  {option.label}
                </span>

                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className={`absolute top-1 right-1 w-2 h-2 rounded-full ${option.colorClass.replace(
                      "text-",
                      "bg-"
                    )}`}
                    aria-hidden="true"
                  />
                )}
              </label>
            );
          })}
        </div>

        {/* Helper text */}
        {!error && helperText && (
          <p className="text-sm text-text-secondary">{helperText}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ComplianceRadioGroup.displayName = "ComplianceRadioGroup";

/**
 * Hook para manejar el estado de cumplimiento
 */
export function useComplianceStatus(initialValue?: ComplianceStatus) {
  const [status, setStatus] = React.useState<ComplianceStatus | undefined>(
    initialValue
  );

  return {
    status,
    setStatus,
    isCompliant: status === "cumple",
    isPartial: status === "parcial",
    isNonCompliant: status === "no_cumple",
    isNotApplicable: status === "no_aplica",
  };
}

// React import for hook
import React from "react";
