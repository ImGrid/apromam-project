/**
 * Utilidades para validación de superficies en fichas de inspección
 *
 * MODELO CORRECTO (3 niveles):
 * Nivel 1: ELIMINADO (ya no comparamos cultivos vs superficie total productor)
 * Nivel 2: Suma de superficie_ha de parcelas = superficie_total_has del productor
 * Nivel 3: Suma de cultivos en UNA parcela <= superficie_ha de ESA parcela
 *
 * REGLAS:
 * - Nivel 2: ERROR si suma ≠ total (bloquea creación de parcelas)
 * - Nivel 3: ERROR si excede, WARNING si es menor
 */

import type { DetalleCultivoParcelaData } from "../types/ficha.types.js";
import type { ParcelaData } from "../entities/Parcela.js";

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
  superficie_total_parcelas: number;
  cultivos_por_parcela: Map<string, CultivoSuperficieDetalle[]>;
  resumen_por_parcela: ParcelaResumen[];
}

export interface ParcelaResumen {
  id_parcela: string;
  numero_parcela: number;
  superficie_definida: number;
  superficie_cultivada: number;
  superficie_disponible: number;
  porcentaje_uso: number;
}

export interface CultivoSuperficieDetalle {
  id_parcela: string;
  id_tipo_cultivo: string;
  nombre_cultivo?: string;
  superficie_ha: number;
}

// ============================================
// VALIDACIÓN NIVEL 2: SUMA PARCELAS = TOTAL PRODUCTOR
// ============================================

/**
 * Valida que la suma de superficie_ha de todas las parcelas sea igual
 * a la superficie_total_has del productor
 *
 * Se usa al crear/editar productor con sus parcelas
 *
 * @param superficieTotalProductor - Superficie total del productor
 * @param superficiesParcelas - Array con superficie de cada parcela
 * @returns Resultado de validación
 */
export function validarSumaParcelasProductor(
  superficieTotalProductor: number,
  superficiesParcelas: number[]
): SuperficieValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sumaParcelas = superficiesParcelas.reduce((sum, s) => sum + s, 0);

  // Permitir diferencia mínima por redondeo (0.001 ha = 10 m²)
  const diferencia = Math.abs(sumaParcelas - superficieTotalProductor);

  if (diferencia > 0.001) {
    if (sumaParcelas > superficieTotalProductor) {
      errors.push(
        `La suma de superficies de parcelas (${sumaParcelas.toFixed(4)} ha) excede la superficie total del productor (${superficieTotalProductor.toFixed(4)} ha). Exceso: ${(sumaParcelas - superficieTotalProductor).toFixed(4)} ha`
      );
    } else {
      errors.push(
        `La suma de superficies de parcelas (${sumaParcelas.toFixed(4)} ha) es menor a la superficie total del productor (${superficieTotalProductor.toFixed(4)} ha). Faltante: ${(superficieTotalProductor - sumaParcelas).toFixed(4)} ha`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// VALIDACIÓN NIVEL 3: CULTIVOS POR PARCELA
// ============================================

/**
 * Valida que la suma de cultivos en UNA parcela no exceda
 * la superficie_ha de ESA parcela
 *
 * Se usa en la ficha de inspección al añadir/editar cultivos
 *
 * @param superficieParcela - Superficie definida de la parcela
 * @param superficiesCultivos - Array con superficie de cada cultivo en la parcela
 * @returns Resultado de validación
 */
export function validarCultivosPorParcela(
  superficieParcela: number,
  superficiesCultivos: number[]
): SuperficieValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sumaCultivos = superficiesCultivos.reduce((sum, s) => sum + s, 0);

  // ERROR si excede la superficie de la parcela
  if (sumaCultivos > superficieParcela) {
    errors.push(
      `Los cultivos suman ${sumaCultivos.toFixed(4)} ha pero la parcela tiene ${superficieParcela.toFixed(4)} ha. Exceso: ${(sumaCultivos - superficieParcela).toFixed(4)} ha`
    );
  }

  // WARNING si no usa toda la superficie (diferencia > 10 m²)
  const disponible = superficieParcela - sumaCultivos;
  if (disponible > 0.001) {
    warnings.push(
      `La parcela tiene ${disponible.toFixed(4)} ha sin cultivar de ${superficieParcela.toFixed(4)} ha (${((disponible / superficieParcela) * 100).toFixed(1)}% sin usar)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// VALIDACIÓN COMPLETA DE FICHA
// ============================================

/**
 * Valida todas las superficies de una ficha completa
 * Aplica validación nivel 3 para cada parcela
 *
 * @param parcelas - Todas las parcelas del productor
 * @param todosLosCultivos - Todos los cultivos de la ficha
 * @returns Resultado completo de validación
 */
export function validarSuperficiesFicha(
  parcelas: ParcelaData[],
  todosLosCultivos: DetalleCultivoParcelaData[]
): SuperficieValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const resumenPorParcela: ParcelaResumen[] = [];
  const cultivosPorParcela = agruparCultivosPorParcela(todosLosCultivos);

  // Validar cada parcela individualmente (Nivel 3)
  for (const parcela of parcelas) {
    const cultivosDeParcela = todosLosCultivos.filter(
      (c) => c.id_parcela === parcela.id_parcela
    );
    const superficiesCultivos = cultivosDeParcela.map((c) => c.superficie_ha);

    const validacion = validarCultivosPorParcela(
      parcela.superficie_ha,
      superficiesCultivos
    );

    // Añadir errores con contexto de parcela
    if (validacion.errors.length > 0) {
      allErrors.push(
        `Parcela ${parcela.numero_parcela}: ${validacion.errors.join(", ")}`
      );
    }

    // Añadir warnings con contexto de parcela
    if (validacion.warnings.length > 0) {
      allWarnings.push(
        `Parcela ${parcela.numero_parcela}: ${validacion.warnings.join(", ")}`
      );
    }

    // Generar resumen
    const sumaCultivos = superficiesCultivos.reduce((s, c) => s + c, 0);
    resumenPorParcela.push({
      id_parcela: parcela.id_parcela,
      numero_parcela: parcela.numero_parcela,
      superficie_definida: parcela.superficie_ha,
      superficie_cultivada: sumaCultivos,
      superficie_disponible: parcela.superficie_ha - sumaCultivos,
      porcentaje_uso:
        parcela.superficie_ha > 0
          ? (sumaCultivos / parcela.superficie_ha) * 100
          : 0,
    });
  }

  // Calcular superficie total de parcelas
  const superficieTotalParcelas = parcelas.reduce(
    (sum, p) => sum + p.superficie_ha,
    0
  );

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    detalles: {
      superficie_total_productor: superficieTotalParcelas, // Esto sería ideal tenerlo del productor
      superficie_total_parcelas: superficieTotalParcelas,
      cultivos_por_parcela: cultivosPorParcela,
      resumen_por_parcela: resumenPorParcela,
    },
  };
}

// ============================================
// UTILIDADES
// ============================================

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
 * Genera un reporte legible de superficies por parcela
 */
export function generarReporteSuperficie(
  detalles: SuperficieDetalles
): string {
  let reporte = "=== REPORTE DE SUPERFICIES ===\n\n";

  reporte += `Superficie Total (suma de parcelas): ${detalles.superficie_total_parcelas.toFixed(4)} ha\n\n`;

  reporte += "=== DETALLE POR PARCELAS ===\n\n";

  for (const parcela of detalles.resumen_por_parcela) {
    reporte += `Parcela ${parcela.numero_parcela}:\n`;
    reporte += `  Superficie definida: ${parcela.superficie_definida.toFixed(4)} ha\n`;
    reporte += `  Superficie cultivada: ${parcela.superficie_cultivada.toFixed(4)} ha (${parcela.porcentaje_uso.toFixed(1)}%)\n`;
    reporte += `  Superficie disponible: ${parcela.superficie_disponible.toFixed(4)} ha\n`;

    const cultivosParcela = detalles.cultivos_por_parcela.get(
      parcela.id_parcela
    );
    if (cultivosParcela && cultivosParcela.length > 0) {
      reporte += `  Cultivos:\n`;
      for (const cultivo of cultivosParcela) {
        const nombre = cultivo.nombre_cultivo || cultivo.id_tipo_cultivo;
        reporte += `    - ${nombre}: ${cultivo.superficie_ha.toFixed(4)} ha\n`;
      }
    }

    reporte += "\n";
  }

  return reporte;
}
