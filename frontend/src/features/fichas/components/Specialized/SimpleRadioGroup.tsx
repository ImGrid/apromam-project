/**
 * SimpleRadioGroup
 * Componente reutilizable de radio buttons para opciones genéricas
 * Usado en Sección 7 para procedencia, categoría, tratamiento, etc.
 */

import { forwardRef } from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface SimpleRadioGroupProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  layout?: "vertical" | "horizontal" | "grid";
}

export const SimpleRadioGroup = forwardRef<HTMLDivElement, SimpleRadioGroupProps>(
  (
    {
      name,
      value,
      onChange,
      options,
      label,
      required = false,
      error,
      disabled = false,
      layout = "vertical",
    },
    ref
  ) => {
    const layoutClasses = {
      vertical: "flex flex-col gap-2",
      horizontal: "flex flex-row gap-4 flex-wrap",
      grid: "grid grid-cols-2 gap-2 sm:grid-cols-4",
    };

    return (
      <div ref={ref} className="space-y-2">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
            {required && (
              <span className="ml-1 text-error-600" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}

        {/* Radio buttons */}
        <div className={layoutClasses[layout]} role="radiogroup" aria-label={label}>
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <label
                key={option.value}
                className={`
                  relative flex items-center gap-2 px-3 py-2
                  border rounded-md cursor-pointer transition-all
                  min-h-[40px]
                  ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-50"}
                  ${
                    isSelected
                      ? "bg-info-50 border-info-500 text-info-900"
                      : "bg-white border-neutral-300 hover:border-neutral-400"
                  }
                `}
              >
                {/* Hidden native radio */}
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="sr-only"
                />

                {/* Custom radio indicator */}
                <div
                  className={`
                    flex-shrink-0 w-4 h-4 rounded-full border-2
                    flex items-center justify-center
                    ${
                      isSelected
                        ? "border-info-500 bg-info-500"
                        : "border-neutral-400 bg-white"
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Label */}
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-error-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SimpleRadioGroup.displayName = "SimpleRadioGroup";
