/**
 * Validaciones Custom para Steps específicos
 * Lógica de negocio que va más allá de la validación Zod
 */

import type { UseFormWatch } from 'react-hook-form';
import type { StepValidation, ValidationError, ValidationWarning } from '../types/validation.types';
import type { CreateFichaCompletaInput } from '../types/ficha.types';

console.log('🛠️ [customValidations] Módulo de validaciones custom cargado');

/**
 * Validación para Step 4: Inspección de Parcelas
 * Valida que la suma de superficies de cultivos no exceda la superficie de la parcela
 */
export async function validateStep4Superficie(
  watch: UseFormWatch<CreateFichaCompletaInput>
): Promise<StepValidation> {
  console.log('🔍 [validateStep4Superficie] Iniciando validación de superficies...');

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Obtener detalles de cultivos
  const detallesCultivo = watch('detalles_cultivo') || [];

  console.log(`🔍 [validateStep4Superficie] Cultivos a validar: ${detallesCultivo.length}`);

  if (detallesCultivo.length === 0) {
    console.log('⚠️ [validateStep4Superficie] No hay cultivos registrados');
    warnings.push({
      field: 'detalles_cultivo',
      message: 'No has registrado ningún cultivo. Se recomienda agregar al menos uno.',
      severity: 'warning',
    });
  }

  // Agrupar cultivos por parcela
  const cultivosPorParcela = new Map<string, typeof detallesCultivo>();

  detallesCultivo.forEach((cultivo, index) => {
    const parcelaId = cultivo.id_parcela;
    if (!parcelaId) {
      console.log(`⚠️ [validateStep4Superficie] Cultivo ${index} no tiene parcela asignada`);
      return;
    }

    if (!cultivosPorParcela.has(parcelaId)) {
      cultivosPorParcela.set(parcelaId, []);
    }
    cultivosPorParcela.get(parcelaId)!.push(cultivo);
  });

  console.log(`🔍 [validateStep4Superficie] Parcelas con cultivos: ${cultivosPorParcela.size}`);

  // Validar superficie por parcela
  // NOTA: Necesitamos acceso a las parcelas para saber la superficie total
  // Como watch no nos da acceso a datos de parcelas del productor,
  // esta validación solo puede hacer checks básicos aquí

  // Por ahora, validamos que todos los cultivos tengan superficie > 0
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

  console.log(`🔍 [validateStep4Superficie] Errores encontrados: ${errors.length}`);
  console.log(`🔍 [validateStep4Superficie] Warnings encontrados: ${warnings.length}`);

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
  console.log('🔍 [validateStep8Destinos] Iniciando validación de destinos...');

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const cosechaVentas = watch('cosecha_ventas') || [];

  console.log(`🔍 [validateStep8Destinos] Registros de cosecha: ${cosechaVentas.length}`);

  if (cosechaVentas.length === 0) {
    console.log('❌ [validateStep8Destinos] No hay registro de cosecha');
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
    console.log('⚠️ [validateStep8Destinos] Hay más de 1 registro de cosecha');
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

  console.log(`🔍 [validateStep8Destinos] Cosecha estimada: ${cosechaEstimada} qq`);
  console.log(`🔍 [validateStep8Destinos] Total destinos: ${totalDestinos} qq`);

  // Validar que la suma de destinos no exceda la cosecha (con 10% de tolerancia)
  const limiteMaximo = cosechaEstimada * 1.1; // 10% de tolerancia

  if (totalDestinos > limiteMaximo) {
    console.log(`❌ [validateStep8Destinos] Destinos exceden el límite. Total: ${totalDestinos}, Límite: ${limiteMaximo}`);
    errors.push({
      field: 'cosecha_ventas.0.destino_consumo_qq',
      message: `La suma de destinos (${totalDestinos.toFixed(2)} qq) excede la cosecha estimada (${cosechaEstimada.toFixed(2)} qq + 10% tolerancia)`,
      severity: 'error',
    });
  }

  // Warning si la distribución es muy baja (menos del 50%)
  const porcentajeDistribucion = cosechaEstimada > 0 ? (totalDestinos / cosechaEstimada) * 100 : 0;

  if (porcentajeDistribucion < 50 && cosechaEstimada > 0) {
    console.log(`⚠️ [validateStep8Destinos] Distribución baja: ${porcentajeDistribucion.toFixed(1)}%`);
    warnings.push({
      field: 'cosecha_ventas.0.destino_consumo_qq',
      message: `Solo has distribuido el ${porcentajeDistribucion.toFixed(1)}% de la cosecha estimada. Verifica los valores.`,
      severity: 'warning',
    });
  }

  console.log(`🔍 [validateStep8Destinos] Errores encontrados: ${errors.length}`);
  console.log(`🔍 [validateStep8Destinos] Warnings encontrados: ${warnings.length}`);

  return {
    isValid: errors.length === 0,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
  };
}
