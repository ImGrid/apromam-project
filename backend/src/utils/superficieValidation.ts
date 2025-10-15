/**
 * Utilidades para validación de superficies en fichas de inspección
 *
 * MODELO CORRECTO:
 * - Las parcelas NO tienen superficie fija (eliminada de BD)
 * - La superficie se define POR CULTIVO en cada ficha
 * - La ÚNICA validación es: suma_total_cultivos <= superficie_total_productor
 *
 * REGLAS:
 * - Si excede: ERROR (bloquear)
 * - Si es menor: WARNING (permitir, solo advertir)
 */

import type { DetalleCultivoParcelaData } from "../types/ficha.types.js";
import type { ProductorData } from "../entities/Productor.js";

// ============================================
// TIPOS DE VALIDACIÓN
// ============================================

export interface SuperficieValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  detalles?: SuperficieDetalles;
}

export interface SuperficieDetalles {
  superficie_total_productor: number;
  superficie_usada_en_ficha: number;
  superficie_disponible: number;
  porcentaje_uso: number;
  cultivos_por_parcela: Map<string, CultivoSuperficieDetalle[]>;
}

export interface CultivoSuperficieDetalle {
  id_parcela: string;
  id_tipo_cultivo: string;
  nombre_cultivo?: string;
  superficie_ha: number;
}

// ============================================
// VALIDACIÓN GLOBAL DE PRODUCTOR
// ============================================

/**
 * Valida que la suma TOTAL de superficies de cultivos no exceda la superficie del productor
 *
 * @param productor - Datos del productor
 * @param detallesCultivo - TODOS los cultivos de la ficha
 * @returns Resultado de validación con detalles
 */
export function validarSuperficieProductor(
  productor: ProductorData,
  detallesCultivo: DetalleCultivoParcelaData[]
): SuperficieValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Calcular superficie total usada (suma de TODOS los cultivos)
  const superficieTotalUsada = detallesCultivo.reduce(
    (sum, cultivo) => sum + cultivo.superficie_ha,
    0
  );

  // VALIDACIÓN CRÍTICA: No puede exceder
  if (superficieTotalUsada > productor.superficie_total_has) {
    errors.push(
      `ERROR: La superficie total de cultivos (${superficieTotalUsada.toFixed(4)} ha) excede la superficie total del productor (${productor.superficie_total_has.toFixed(4)} ha). Diferencia: +${(superficieTotalUsada - productor.superficie_total_has).toFixed(4)} ha`
    );
  }

  // WARNING: Si no usa toda la superficie disponible
  const superficieDisponible =
    productor.superficie_total_has - superficieTotalUsada;
  if (superficieDisponible > 0.01) {
    warnings.push(
      `ADVERTENCIA: Hay ${superficieDisponible.toFixed(4)} ha sin cultivar de ${productor.superficie_total_has.toFixed(4)} ha totales declaradas (${((superficieDisponible / productor.superficie_total_has) * 100).toFixed(1)}% sin usar)`
    );
  }

  // Agrupar cultivos por parcela para el reporte
  const cultivosPorParcela = agruparCultivosPorParcela(detallesCultivo);

  const porcentajeUso =
    productor.superficie_total_has > 0
      ? (superficieTotalUsada / productor.superficie_total_has) * 100
      : 0;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    detalles: {
      superficie_total_productor: productor.superficie_total_has,
      superficie_usada_en_ficha: superficieTotalUsada,
      superficie_disponible: superficieDisponible,
      porcentaje_uso: porcentajeUso,
      cultivos_por_parcela: cultivosPorParcela,
    },
  };
}

// ============================================
// VALIDACIÓN PRINCIPAL DE FICHA
// ============================================

/**
 * Valida las superficies de una ficha completa
 * ÚNICA VALIDACIÓN: suma_total_cultivos <= superficie_total_productor
 *
 * @param productor - Datos del productor
 * @param detallesCultivo - Todos los detalles de cultivo de la ficha
 * @returns Resultado completo de validación
 */
export function validarSuperficiesFicha(
  productor: ProductorData,
  detallesCultivo: DetalleCultivoParcelaData[]
): SuperficieValidationResult {
  // Validación global contra superficie_total del productor
  return validarSuperficieProductor(productor, detallesCultivo);
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Calcula la superficie total usada en una lista de cultivos
 */
export function calcularSuperficieTotal(
  cultivos: DetalleCultivoParcelaData[]
): number {
  return cultivos.reduce((sum, cultivo) => sum + cultivo.superficie_ha, 0);
}

/**
 * Agrupa cultivos por id de parcela para generar reportes
 */
export function agruparCultivosPorParcela(
  cultivos: DetalleCultivoParcelaData[]
): Map<string, CultivoSuperficieDetalle[]> {
  const map = new Map<string, CultivoSuperficieDetalle[]>();

  for (const cultivo of cultivos) {
    const cultivosExistentes = map.get(cultivo.id_parcela) || [];
    cultivosExistentes.push({
      id_parcela: cultivo.id_parcela,
      id_tipo_cultivo: cultivo.id_tipo_cultivo,
      nombre_cultivo: cultivo.nombre_cultivo,
      superficie_ha: cultivo.superficie_ha,
    });
    map.set(cultivo.id_parcela, cultivosExistentes);
  }

  return map;
}

/**
 * Genera un reporte legible de superficies
 */
export function generarReporteSuperficie(
  detalles: SuperficieDetalles
): string {
  let reporte = "=== REPORTE DE SUPERFICIES ===\n\n";

  reporte += `Superficie Total del Productor: ${detalles.superficie_total_productor.toFixed(4)} ha\n`;
  reporte += `Superficie Usada en Ficha: ${detalles.superficie_usada_en_ficha.toFixed(4)} ha (${detalles.porcentaje_uso.toFixed(1)}%)\n`;
  reporte += `Superficie Disponible: ${detalles.superficie_disponible.toFixed(4)} ha\n\n`;

  reporte += "=== DETALLE POR PARCELAS ===\n\n";

  for (const [idParcela, cultivos] of detalles.cultivos_por_parcela.entries()) {
    const superficieParcela = cultivos.reduce(
      (sum, c) => sum + c.superficie_ha,
      0
    );
    reporte += `Parcela ${idParcela}:\n`;
    reporte += `  Superficie cultivada: ${superficieParcela.toFixed(4)} ha\n`;
    reporte += `  Cultivos:\n`;

    for (const cultivo of cultivos) {
      const nombre = cultivo.nombre_cultivo || cultivo.id_tipo_cultivo;
      reporte += `    - ${nombre}: ${cultivo.superficie_ha.toFixed(4)} ha\n`;
    }

    reporte += "\n";
  }

  return reporte;
}
