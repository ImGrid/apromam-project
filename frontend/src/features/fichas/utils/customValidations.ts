/**
 * Validaciones Custom para Steps específicos
 * Lógica de negocio que va más allá de la validación Zod
 */

import type { UseFormWatch } from 'react-hook-form';
import type { StepValidation, ValidationError, ValidationWarning } from '../types/validation.types';
import type { CreateFichaCompletaInput } from '../types/ficha.types';
import type { Parcela } from '@/features/parcelas';

/**
 * Validación para Step 4: Inspección de Parcelas
 * Valida que la suma de superficies de cultivos no exceda la superficie de la parcela
 */
export async function validateStep4Superficie(
  watch: UseFormWatch<CreateFichaCompletaInput>,
  parcelas: Parcela[]
): Promise<StepValidation> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Obtener detalles de cultivos
  const detallesCultivo = watch('detalles_cultivo') || [];

  if (detallesCultivo.length === 0) {
    warnings.push({
      field: 'detalles_cultivo',
      message: 'No has registrado ningún cultivo. Se recomienda agregar al menos uno.',
      severity: 'warning',
    });
  }

  // Validaciones básicas: superficie > 0 y tipo cultivo existe
  detallesCultivo.forEach((cultivo, index) => {
    if (!cultivo.superficie_ha || cultivo.superficie_ha <= 0) {
      errors.push({
        field: `detalles_cultivo.${index}.superficie_ha`,
        message: 'La superficie debe ser mayor a 0',
        severity: 'error',
      });
    }

    if (!cultivo.id_tipo_cultivo) {
      errors.push({
        field: `detalles_cultivo.${index}.id_tipo_cultivo`,
        message: 'Debe seleccionar un tipo de cultivo',
        severity: 'error',
      });
    }
  });

  // VALIDACIÓN NIVEL 3: Suma de cultivos por parcela no debe exceder superficie de la parcela
  if (parcelas.length > 0) {
    // Agrupar cultivos por parcela
    const cultivosPorParcela = new Map<string, typeof detallesCultivo>();

    detallesCultivo.forEach((cultivo) => {
      const parcelaId = cultivo.id_parcela;
      if (!parcelaId) return;

      if (!cultivosPorParcela.has(parcelaId)) {
        cultivosPorParcela.set(parcelaId, []);
      }
      cultivosPorParcela.get(parcelaId)!.push(cultivo);
    });

    // Validar cada parcela
    parcelas.forEach((parcela) => {
      const cultivosDeParcela = cultivosPorParcela.get(parcela.id_parcela) || [];
      const sumaCultivos = cultivosDeParcela.reduce((sum, c) => {
        return sum + (c.superficie_ha || 0);
      }, 0);

      // ERROR si la suma de cultivos excede la superficie de la parcela
      if (sumaCultivos > parcela.superficie_ha) {
        const exceso = sumaCultivos - parcela.superficie_ha;
        errors.push({
          field: 'detalles_cultivo',
          message: `Parcela ${parcela.numero_parcela}: Los cultivos suman ${sumaCultivos.toFixed(4)} ha pero la parcela tiene ${parcela.superficie_ha.toFixed(4)} ha. Exceso: ${exceso.toFixed(4)} ha`,
          severity: 'error',
        });
      }

      // WARNING si no usa toda la superficie disponible
      const disponible = parcela.superficie_ha - sumaCultivos;
      if (disponible > 0.001 && sumaCultivos > 0) {
        const porcentajeSinUsar = (disponible / parcela.superficie_ha) * 100;
        warnings.push({
          field: 'detalles_cultivo',
          message: `Parcela ${parcela.numero_parcela}: Tiene ${disponible.toFixed(4)} ha sin cultivar (${porcentajeSinUsar.toFixed(1)}% sin usar)`,
          severity: 'warning',
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
  };
}

/**
 * Validación para Step 8: Cosecha y Ventas
 * Valida que la suma de destinos no exceda la cosecha estimada (con 10% de tolerancia)
 */
export async function validateStep8Destinos(
  watch: UseFormWatch<CreateFichaCompletaInput>
): Promise<StepValidation> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const cosechaVentas = watch('cosecha_ventas') || [];

  if (cosechaVentas.length === 0) {
    errors.push({
      field: 'cosecha_ventas',
      message: 'Debe registrar la información de cosecha y ventas',
      severity: 'error',
    });

    return {
      isValid: false,
      hasErrors: true,
      hasWarnings: false,
      errors,
      warnings,
    };
  }

  if (cosechaVentas.length > 1) {
    warnings.push({
      field: 'cosecha_ventas',
      message: 'Solo debe haber un registro de cosecha y ventas',
      severity: 'warning',
    });
  }

  // Validar el primer (y debería ser único) registro
  const cosecha = cosechaVentas[0];

  if (!cosecha) {
    return {
      isValid: false,
      hasErrors: true,
      hasWarnings: false,
      errors: [{
        field: 'cosecha_ventas.0',
        message: 'Falta información de cosecha',
        severity: 'error',
      }],
      warnings: [],
    };
  }

  const cosechaEstimada = cosecha.cosecha_estimada_qq || 0;
  const destinoConsumo = cosecha.destino_consumo_qq || 0;
  const destinoSemilla = cosecha.destino_semilla_qq || 0;
  const destinoVentas = cosecha.destino_ventas_qq || 0;

  const totalDestinos = destinoConsumo + destinoSemilla + destinoVentas;

  // Validar que la suma de destinos no exceda la cosecha (con 10% de tolerancia)
  const limiteMaximo = cosechaEstimada * 1.1; // 10% de tolerancia

  if (totalDestinos > limiteMaximo) {
    errors.push({
      field: 'cosecha_ventas.0.destino_consumo_qq',
      message: `La suma de destinos (${totalDestinos.toFixed(2)} qq) excede la cosecha estimada (${cosechaEstimada.toFixed(2)} qq + 10% tolerancia)`,
      severity: 'error',
    });
  }

  // Warning si la distribución es muy baja (menos del 50%)
  const porcentajeDistribucion = cosechaEstimada > 0 ? (totalDestinos / cosechaEstimada) * 100 : 0;

  if (porcentajeDistribucion < 50 && cosechaEstimada > 0) {
    warnings.push({
      field: 'cosecha_ventas.0.destino_consumo_qq',
      message: `Solo has distribuido el ${porcentajeDistribucion.toFixed(1)}% de la cosecha estimada. Verifica los valores.`,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
  };
}
