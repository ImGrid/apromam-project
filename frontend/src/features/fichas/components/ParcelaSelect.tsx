/**
 * Componente ParcelaSelect
 * Selector de parcelas del productor con información de superficie
 */

import { useFormContext } from "react-hook-form";
import { useProductorParcelas } from "@/features/productores/hooks/useProductorParcelas";
import type { FichaCompletaFormData } from "../schemas/ficha.schemas";

interface ParcelaSelectProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function ParcelaSelect({
  name,
  label = "Parcela",
  required = false,
  error,
  className = "",
}: ParcelaSelectProps) {
  const { register, watch } = useFormContext<FichaCompletaFormData>();

  // Obtener código de productor de la sección 1
  const codigoProductor = watch("ficha.codigo_productor");

  // Obtener parcelas del productor
  const { parcelas, isLoading, error: fetchError, hasData } = useProductorParcelas(codigoProductor);

  // Estado del selector
  const disabled = !codigoProductor || isLoading || !hasData;
  const showError = error || fetchError;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        {...register(name as any)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${showError ? "border-red-500" : "border-gray-300"}
        `}
      >
        <option value="">
          {!codigoProductor
            ? "Primero seleccione un productor"
            : isLoading
            ? "Cargando parcelas..."
            : !hasData || parcelas.length === 0
            ? "No hay parcelas disponibles"
            : "Seleccione una parcela"}
        </option>

        {parcelas.map((parcela) => (
          <option key={parcela.id_parcela} value={parcela.id_parcela}>
            Parcela {parcela.numero_parcela}
            {parcela.superficie_ha ? ` - ${parcela.superficie_ha.toFixed(2)} ha` : " (superficie pendiente)"}
            {parcela.utiliza_riego ? " • Con riego" : ""}
          </option>
        ))}
      </select>

      {/* Mensajes de error */}
      {showError && (
        <p className="mt-1 text-sm text-red-600">{showError}</p>
      )}

      {/* Información adicional cuando hay parcelas */}
      {hasData && parcelas.length > 0 && !isLoading && (
        <p className="mt-1 text-xs text-gray-500">
          {parcelas.length} parcela{parcelas.length !== 1 ? "s" : ""} disponible{parcelas.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
