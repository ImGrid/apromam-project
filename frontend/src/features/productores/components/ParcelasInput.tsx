/**
 * ParcelasInput Component
 * Permite al gerente definir las superficies de las parcelas al crear un productor
 *
 * VALIDACIÓN NIVEL 2:
 * Suma de superficie_ha de parcelas DEBE ser igual a superficie_total_has del productor
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FormSection, FormField, Input, Button, Alert } from "@/shared/components/ui";

export interface ParcelaSuperficie {
  numero: number;
  superficie_ha: number;
}

interface ParcelasInputProps {
  superficieTotalProductor: number;
  parcelas: ParcelaSuperficie[];
  onChange: (parcelas: ParcelaSuperficie[]) => void;
  error?: string;
}

export function ParcelasInput({
  superficieTotalProductor,
  parcelas,
  onChange,
  error,
}: ParcelasInputProps) {
  const [validationError, setValidationError] = useState<string>("");
  const [validationWarning, setValidationWarning] = useState<string>("");

  // Calcular suma de superficies
  const sumaParcelas = parcelas.reduce((sum, p) => sum + (p.superficie_ha || 0), 0);
  const diferencia = Math.abs(sumaParcelas - superficieTotalProductor);
  const tolerancia = 0.001; // 10 m²

  // Validar Nivel 2
  useEffect(() => {
    if (parcelas.length === 0) {
      setValidationError("");
      setValidationWarning("");
      return;
    }

    if (diferencia > tolerancia) {
      if (sumaParcelas > superficieTotalProductor) {
        setValidationError(
          `La suma de parcelas (${sumaParcelas.toFixed(4)} ha) EXCEDE el total del productor (${superficieTotalProductor.toFixed(4)} ha). Exceso: ${(sumaParcelas - superficieTotalProductor).toFixed(4)} ha`
        );
        setValidationWarning("");
      } else {
        setValidationError(
          `La suma de parcelas (${sumaParcelas.toFixed(4)} ha) es MENOR al total del productor (${superficieTotalProductor.toFixed(4)} ha). Faltante: ${(superficieTotalProductor - sumaParcelas).toFixed(4)} ha`
        );
        setValidationWarning("");
      }
    } else {
      setValidationError("");
      setValidationWarning("");
    }
  }, [sumaParcelas, superficieTotalProductor, parcelas.length, diferencia, tolerancia]);

  const handleAddParcela = () => {
    const ultimoNumero = parcelas.length > 0 ? Math.max(...parcelas.map(p => p.numero)) : 0;
    const nuevaParcela: ParcelaSuperficie = {
      numero: ultimoNumero + 1,
      superficie_ha: 0,
    };
    onChange([...parcelas, nuevaParcela]);
  };

  const handleRemoveParcela = (index: number) => {
    const nuevasParcelas = parcelas.filter((_, i) => i !== index);
    onChange(nuevasParcelas);
  };

  const handleSuperficieChange = (index: number, valor: string) => {
    const superficie = parseFloat(valor) || 0;
    const nuevasParcelas = [...parcelas];
    nuevasParcelas[index] = {
      ...nuevasParcelas[index],
      superficie_ha: superficie,
    };
    onChange(nuevasParcelas);
  };

  const isValid = diferencia <= tolerancia && parcelas.length > 0;

  return (
    <FormSection
      title="Definir Superficies de Parcelas"
      description="Define la superficie de cada parcela. La suma DEBE ser igual a la superficie total del productor."
    >
      <div className="space-y-4">
        {/* Resumen de validación */}
        <div className="p-4 border rounded-lg bg-neutral-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Superficie Total del Productor:{" "}
                <span className="font-bold text-primary">
                  {superficieTotalProductor.toFixed(4)} ha
                </span>
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Suma de Parcelas:{" "}
                <span className={`font-semibold ${isValid ? "text-success" : "text-danger"}`}>
                  {sumaParcelas.toFixed(4)} ha
                </span>
              </p>
              {parcelas.length > 0 && (
                <p className="mt-1 text-xs text-neutral-500">
                  {parcelas.length} parcela{parcelas.length !== 1 ? "s" : ""} definida{parcelas.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {isValid && parcelas.length > 0 && (
              <CheckCircle2 className="w-6 h-6 text-success" />
            )}
            {!isValid && parcelas.length > 0 && (
              <AlertTriangle className="w-6 h-6 text-danger" />
            )}
          </div>
        </div>

        {/* Mensajes de validación */}
        {validationError && (
          <Alert type="error" message={validationError} />
        )}
        {validationWarning && (
          <Alert type="warning" message={validationWarning} />
        )}
        {error && (
          <Alert type="error" message={error} />
        )}

        {/* Lista de parcelas */}
        {parcelas.length > 0 && (
          <div className="space-y-3">
            {parcelas.map((parcela, index) => (
              <div
                key={index}
                className="flex items-end gap-3 p-3 border rounded-lg bg-white"
              >
                <FormField label={`Parcela ${parcela.numero}`} className="flex-1">
                  <Input
                    type="number"
                    step="0.0001"
                    min="0.01"
                    max="10000"
                    value={parcela.superficie_ha || ""}
                    onChange={(e) => handleSuperficieChange(index, e.target.value)}
                    placeholder="0.0000"
                  />
                </FormField>
                <span className="mb-2 text-sm font-medium text-text-secondary w-8">ha</span>
                <Button
                  type="button"
                  variant="danger"
                  size="small"
                  onClick={() => handleRemoveParcela(index)}
                  disabled={parcelas.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Botón agregar parcela */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddParcela}
          fullWidth
          disabled={superficieTotalProductor <= 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          {parcelas.length === 0 ? "Agregar Primera Parcela" : "Agregar Parcela"}
        </Button>

        {superficieTotalProductor <= 0 && (
          <p className="text-sm text-neutral-500 text-center">
            Primero define la superficie total del productor
          </p>
        )}
      </div>
    </FormSection>
  );
}
