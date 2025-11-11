import ExcelJS from "exceljs";
import { createAuthLogger } from "../utils/logger.js";
import {
  ReporteRepository,
  ProductorReporteRow,
} from "../repositories/ReporteRepository.js";

const logger = createAuthLogger();

// Interface para agrupar parcelas por productor
interface ProductorConParcelas {
  // Datos del productor (iguales para todas las parcelas)
  numero_productor: number;
  codigo_productor: string;
  nombre_productor: string;
  ci_documento: string | null;
  nombre_organizacion: string;
  nombre_comunidad: string;
  nombre_provincia: string;
  anio_ingreso_programa: number;
  categoria_actual: string;

  // Datos de ficha
  fecha_inspeccion: Date | null;
  inspector_interno: string | null;
  no_conformidades: string | null;
  acciones_correctivas: string | null;

  // Array de parcelas del productor (CADA PARCELA tiene sus propios datos de cultivos)
  parcelas: {
    numero_parcela: number;
    superficie_ha: number;
    latitud_sud: number | null;
    longitud_oeste: number | null;

    // Gestión pasada (por parcela)
    pasada_mani: number;
    pasada_maiz: number;
    pasada_papa: number;
    pasada_aji: number;
    pasada_leguminosa: number;
    pasada_otros: number;
    pasada_descanso: number;
    pasada_total: number;
    pasada_prod_real: number;

    // Gestión actual (por parcela)
    actual_mani: number;
    actual_maiz: number;
    actual_papa: number;
    actual_aji: number;
    actual_leguminosa: number;
    actual_otros: number;
    actual_descanso: number;
    actual_total: number;
    actual_prod_estim: number;
    actual_prod_real: number;

    // Gestión futura (por parcela)
    futura_mani: number;
    futura_maiz: number;
    futura_papa: number;
    futura_aji: number;
    futura_leguminosa: number;
    futura_otros: number;
    futura_descanso: number;
    futura_total: number;
  }[];
}

export class ReporteService {
  private reporteRepository: ReporteRepository;

  constructor(reporteRepository: ReporteRepository) {
    this.reporteRepository = reporteRepository;
  }

  // Genera el archivo Excel completo del reporte
  async generarReporteExcel(): Promise<Buffer> {
    logger.info("Iniciando generación de reporte Excel");

    // 1. Obtener gestion activa
    const gestionActual = await this.reporteRepository.obtenerGestionActiva();
    const gestionPasada = gestionActual - 1;
    const gestionFutura = gestionActual + 1;

    logger.info({ gestionPasada, gestionActual, gestionFutura }, "Gestiones del reporte");

    // 2. Obtener datos
    const datos = await this.reporteRepository.obtenerDatosReporte(gestionActual);

    if (datos.length === 0) {
      throw new Error("No hay datos para generar el reporte");
    }

    // 3. Obtener cultivo certificable dinámicamente
    const cultivoCertificable = await this.reporteRepository.obtenerCultivoCertificable();
    logger.info({ cultivo_certificable: cultivoCertificable }, "Cultivo certificable obtenido");

    // 4. Filtrar datos por categoría (excluir T0)
    const categorias = ["E", "T1", "T2"] as const;
    const datosPorCategoria = {
      E: datos.filter((d) => d.categoria_actual === "E"),
      T1: datos.filter((d) => d.categoria_actual === "T1"),
      T2: datos.filter((d) => d.categoria_actual === "T2"),
    };

    logger.info(
      {
        total_E: datosPorCategoria.E.length,
        total_T1: datosPorCategoria.T1.length,
        total_T2: datosPorCategoria.T2.length,
      },
      "Datos filtrados por categoría"
    );

    // 5. Crear workbook
    const workbook = new ExcelJS.Workbook();

    // 6. Crear una hoja para cada categoría
    for (const categoria of categorias) {
      const datosCategoria = datosPorCategoria[categoria];

      if (datosCategoria.length === 0) {
        logger.info({ categoria }, "Sin datos para esta categoría, omitiendo hoja");
        continue;
      }

      this.crearHojaCategoria(
        workbook,
        categoria,
        datosCategoria,
        gestionPasada,
        gestionActual,
        gestionFutura,
        cultivoCertificable
      );
    }

    // 7. Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const finalBuffer = Buffer.from(buffer as ArrayBuffer);

    logger.info({ size_bytes: finalBuffer.length }, "Reporte Excel generado exitosamente");

    return finalBuffer;
  }

  // Agrupa los datos primero por comunidad y luego por productor
  private agruparPorComunidadYProductor(datos: ProductorReporteRow[]): Record<string, ProductorConParcelas[]> {
    const agrupado: Record<string, Record<string, ProductorConParcelas>> = {};

    let numeroProductorGlobal = 1;

    for (const row of datos) {
      const comunidad = row.nombre_comunidad;
      const codigoProductor = row.codigo_productor;

      // Inicializar comunidad si no existe
      if (!agrupado[comunidad]) {
        agrupado[comunidad] = {};
      }

      // Si el productor ya existe en esta comunidad, solo agregar la parcela
      if (agrupado[comunidad][codigoProductor]) {
        agrupado[comunidad][codigoProductor].parcelas.push({
          numero_parcela: row.numero_parcela,
          superficie_ha: row.superficie_ha,
          latitud_sud: row.latitud_sud,
          longitud_oeste: row.longitud_oeste,

          // Datos de cultivos de esta parcela
          pasada_mani: row.pasada_mani,
          pasada_maiz: row.pasada_maiz,
          pasada_papa: row.pasada_papa,
          pasada_aji: row.pasada_aji,
          pasada_leguminosa: row.pasada_leguminosa,
          pasada_otros: row.pasada_otros,
          pasada_descanso: row.pasada_descanso,
          pasada_total: row.pasada_total,
          pasada_prod_real: row.pasada_prod_real,

          actual_mani: row.actual_mani,
          actual_maiz: row.actual_maiz,
          actual_papa: row.actual_papa,
          actual_aji: row.actual_aji,
          actual_leguminosa: row.actual_leguminosa,
          actual_otros: row.actual_otros,
          actual_descanso: row.actual_descanso,
          actual_total: row.actual_total,
          actual_prod_estim: row.actual_prod_estim,
          actual_prod_real: row.actual_prod_real,

          futura_mani: row.futura_mani,
          futura_maiz: row.futura_maiz,
          futura_papa: row.futura_papa,
          futura_aji: row.futura_aji,
          futura_leguminosa: row.futura_leguminosa,
          futura_otros: row.futura_otros,
          futura_descanso: row.futura_descanso,
          futura_total: row.futura_total,
        });
      } else {
        // Crear nuevo productor
        agrupado[comunidad][codigoProductor] = {
          numero_productor: numeroProductorGlobal++,
          codigo_productor: row.codigo_productor,
          nombre_productor: row.nombre_productor,
          ci_documento: row.ci_documento,
          nombre_organizacion: row.nombre_organizacion,
          nombre_comunidad: row.nombre_comunidad,
          nombre_provincia: row.nombre_provincia,
          anio_ingreso_programa: row.anio_ingreso_programa,
          categoria_actual: row.categoria_actual,

          fecha_inspeccion: row.fecha_inspeccion,
          inspector_interno: row.inspector_interno,
          no_conformidades: row.no_conformidades,
          acciones_correctivas: row.acciones_correctivas,

          parcelas: [{
            numero_parcela: row.numero_parcela,
            superficie_ha: row.superficie_ha,
            latitud_sud: row.latitud_sud,
            longitud_oeste: row.longitud_oeste,

            // Datos de cultivos de la primera parcela
            pasada_mani: row.pasada_mani,
            pasada_maiz: row.pasada_maiz,
            pasada_papa: row.pasada_papa,
            pasada_aji: row.pasada_aji,
            pasada_leguminosa: row.pasada_leguminosa,
            pasada_otros: row.pasada_otros,
            pasada_descanso: row.pasada_descanso,
            pasada_total: row.pasada_total,
            pasada_prod_real: row.pasada_prod_real,

            actual_mani: row.actual_mani,
            actual_maiz: row.actual_maiz,
            actual_papa: row.actual_papa,
            actual_aji: row.actual_aji,
            actual_leguminosa: row.actual_leguminosa,
            actual_otros: row.actual_otros,
            actual_descanso: row.actual_descanso,
            actual_total: row.actual_total,
            actual_prod_estim: row.actual_prod_estim,
            actual_prod_real: row.actual_prod_real,

            futura_mani: row.futura_mani,
            futura_maiz: row.futura_maiz,
            futura_papa: row.futura_papa,
            futura_aji: row.futura_aji,
            futura_leguminosa: row.futura_leguminosa,
            futura_otros: row.futura_otros,
            futura_descanso: row.futura_descanso,
            futura_total: row.futura_total,
          }],
        };
      }
    }

    // Convertir a formato final
    const resultado: Record<string, ProductorConParcelas[]> = {};
    for (const [comunidad, productoresMap] of Object.entries(agrupado)) {
      resultado[comunidad] = Object.values(productoresMap);
    }

    return resultado;
  }

  // Crea una hoja de Excel para una categoría específica
  private crearHojaCategoria(
    workbook: ExcelJS.Workbook,
    categoria: string,
    datos: ProductorReporteRow[],
    gestionPasada: number,
    gestionActual: number,
    gestionFutura: number,
    cultivoCertificable: string
  ): void {
    // Nombre de la hoja según categoría
    const nombreHoja = `Productores ${categoria}`;
    const worksheet = workbook.addWorksheet(nombreHoja);

    logger.info({ categoria, total_productores: datos.length }, "Creando hoja para categoría");

    // Colores de gestión (definidos aquí para reutilizar en totales)
    const colorGestionPasada = "FFc4d79b"; // RGB(196, 215, 155) - Verde manzana suave
    const colorGestionFutura = "FFfcd5b4"; // RGB(252, 213, 180) - Durazno claro

    // Agrupar por comunidad y productor
    const porComunidad = this.agruparPorComunidadYProductor(datos);

    // Escribir headers principales (filas 1-3)
    this.escribirHeadersPrincipales(worksheet, gestionActual, categoria);

    // Escribir headers de gestión con merge (fila 5)
    this.escribirHeadersGestion(worksheet, gestionPasada, gestionActual, gestionFutura);

    // Escribir fila de temporada (fila 6)
    this.escribirFilaTemporada(worksheet);

    // Escribir headers de columnas (fila 7)
    this.escribirHeadersColumnas(worksheet, cultivoCertificable);

    // Combinar verticalmente columnas que no tienen gestión (A-I y AM-AR)
    this.combinarColumnasVerticales(worksheet);

    // Escribir datos agrupados por comunidad y productor
    let currentRow = 8; // Empezamos en fila 8 después de los headers
    const filasTotalesComunidades: number[] = [];

    for (const [nombreComunidad, productores] of Object.entries(porComunidad)) {
      const filaInicioComunidad = currentRow;

      // Escribir todos los productores de esta comunidad
      for (const productor of productores) {
        currentRow = this.escribirProductorConParcelas(worksheet, currentRow, productor);
      }

      const filaFinComunidad = currentRow - 1;

      // Escribir TOTAL COMUNIDAD (usa color de gestión futura)
      this.escribirTotalComunidad(worksheet, currentRow, nombreComunidad, filaInicioComunidad, filaFinComunidad, colorGestionFutura);
      filasTotalesComunidades.push(currentRow);
      currentRow++;
    }

    // Escribir TOTAL GENERAL (usa color de gestión pasada)
    this.escribirTotalGeneral(worksheet, currentRow, filasTotalesComunidades, colorGestionPasada);

    // Aplicar estilos y anchos de columnas
    this.aplicarEstilos(worksheet);

    logger.info({ categoria, total_filas: currentRow }, "Hoja creada exitosamente");
  }

  // Escribe un productor con todas sus parcelas (con cell merging)
  // Retorna el número de la siguiente fila disponible
  private escribirProductorConParcelas(
    worksheet: ExcelJS.Worksheet,
    filaInicio: number,
    productor: ProductorConParcelas
  ): number {
    const numParcelas = productor.parcelas.length;
    const filaFinParcelas = filaInicio + numParcelas - 1; // Última fila de parcelas
    const filaSubtotal = filaFinParcelas + 1; // Fila del subtotal "X Parcelas"

    // Combinar datos del productor (columnas A-G y AM-AR) incluyendo la fila de subtotal
    // NO combinar H-AL (datos de parcelas y cultivos)
    if (numParcelas >= 1) {
      // Combinar datos básicos del productor (A-G) hasta la fila de subtotal
      worksheet.mergeCells(`A${filaInicio}:A${filaSubtotal}`); // No.
      worksheet.mergeCells(`B${filaInicio}:B${filaSubtotal}`); // Código
      worksheet.mergeCells(`C${filaInicio}:C${filaSubtotal}`); // Organización
      worksheet.mergeCells(`D${filaInicio}:D${filaSubtotal}`); // Nombre y apellido
      worksheet.mergeCells(`E${filaInicio}:E${filaSubtotal}`); // C.I.
      worksheet.mergeCells(`F${filaInicio}:F${filaSubtotal}`); // Comunidad
      worksheet.mergeCells(`G${filaInicio}:G${filaSubtotal}`); // Provincia

      // Combinar datos finales del productor (AM-AR = 39-44)
      for (let col = 39; col <= 44; col++) {
        const letra = this.numeroALetra(col);
        worksheet.mergeCells(`${letra}${filaInicio}:${letra}${filaSubtotal}`);
      }
    }

    // Escribir datos del productor en la primera fila (combinados verticalmente)
    const primeraFila = worksheet.getRow(filaInicio);
    primeraFila.getCell(1).value = productor.numero_productor; // A: No.
    primeraFila.getCell(2).value = productor.codigo_productor; // B: Código
    primeraFila.getCell(3).value = productor.nombre_organizacion; // C: Organización
    primeraFila.getCell(4).value = productor.nombre_productor; // D: Nombre
    primeraFila.getCell(5).value = productor.ci_documento; // E: C.I.
    primeraFila.getCell(6).value = productor.nombre_comunidad; // F: Comunidad
    primeraFila.getCell(7).value = productor.nombre_provincia; // G: Provincia

    // Datos finales del productor (combinados)
    primeraFila.getCell(39).value = productor.anio_ingreso_programa; // AM
    primeraFila.getCell(40).value = productor.fecha_inspeccion; // AN
    primeraFila.getCell(41).value = productor.inspector_interno; // AO
    primeraFila.getCell(42).value = productor.categoria_actual; // AP
    primeraFila.getCell(43).value = productor.no_conformidades; // AQ
    primeraFila.getCell(44).value = productor.acciones_correctivas; // AR

    // Agregar bordes y centrado a celdas del productor
    const borderStyle: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF000000" } };
    for (let col = 1; col <= 7; col++) {
      const cell = primeraFila.getCell(col);
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
    for (let col = 39; col <= 44; col++) {
      const cell = primeraFila.getCell(col);
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }

    // Escribir datos de CADA PARCELA (H-AL: datos específicos por parcela)
    for (let i = 0; i < numParcelas; i++) {
      const fila = worksheet.getRow(filaInicio + i);
      const parcela = productor.parcelas[i];

      // Columnas H-K: Datos básicos de la parcela
      fila.getCell(8).value = parcela.numero_parcela; // H: Identificación de parcelas
      fila.getCell(9).value = parcela.superficie_ha; // I: Área Parcela Actual (ha)
      fila.getCell(10).value = parcela.latitud_sud; // J: Latitud Sud
      fila.getCell(11).value = parcela.longitud_oeste; // K: Longitud Oeste

      // Datos de cultivos POR PARCELA (ahora vienen de detalle_cultivo_parcela)
      // Cada parcela tiene sus propios valores correctos

      // Columnas L-T: Gestión pasada (12-20: 9 columnas)
      fila.getCell(12).value = parcela.pasada_mani;
      fila.getCell(13).value = parcela.pasada_maiz;
      fila.getCell(14).value = parcela.pasada_papa;
      fila.getCell(15).value = parcela.pasada_aji;
      fila.getCell(16).value = parcela.pasada_leguminosa;
      fila.getCell(17).value = parcela.pasada_otros;
      fila.getCell(18).value = parcela.pasada_descanso;
      fila.getCell(19).value = parcela.pasada_total;
      // Prod. Real: solo escribir si la parcela tiene el cultivo certificable (Maní)
      if (parcela.pasada_mani > 0) {
        fila.getCell(20).value = parcela.pasada_prod_real;
      }

      // Columnas U-AD: Gestión actual (21-30: 10 columnas)
      fila.getCell(21).value = parcela.actual_mani;
      fila.getCell(22).value = parcela.actual_maiz;
      fila.getCell(23).value = parcela.actual_papa;
      fila.getCell(24).value = parcela.actual_aji;
      fila.getCell(25).value = parcela.actual_leguminosa;
      fila.getCell(26).value = parcela.actual_otros;
      fila.getCell(27).value = parcela.actual_descanso;
      fila.getCell(28).value = parcela.actual_total;
      // Prod. Estim. y Prod. Real: solo escribir si la parcela tiene el cultivo certificable (Maní)
      if (parcela.actual_mani > 0) {
        fila.getCell(29).value = parcela.actual_prod_estim;
        fila.getCell(30).value = parcela.actual_prod_real;
      }

      // Columnas AE-AL: Gestión futura (31-38: 8 columnas)
      fila.getCell(31).value = parcela.futura_mani;
      fila.getCell(32).value = parcela.futura_maiz;
      fila.getCell(33).value = parcela.futura_papa;
      fila.getCell(34).value = parcela.futura_aji;
      fila.getCell(35).value = parcela.futura_leguminosa;
      fila.getCell(36).value = parcela.futura_otros;
      fila.getCell(37).value = parcela.futura_descanso;
      fila.getCell(38).value = parcela.futura_total;

      // Agregar bordes y centrado a todas las celdas de datos de parcela (H-AL: 8-38)
      for (let col = 8; col <= 38; col++) {
        const cell = fila.getCell(col);
        cell.border = {
          top: borderStyle,
          left: borderStyle,
          bottom: borderStyle,
          right: borderStyle,
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    }

    // Escribir fila de subtotal del productor (ya calculada como filaSubtotal)
    const rowSubtotal = worksheet.getRow(filaSubtotal);

    // NO combinar - el texto va solo en H
    // Calcular superficie total de las parcelas
    const superficieTotal = productor.parcelas.reduce((sum, p) => sum + p.superficie_ha, 0);

    // Texto de subtotal SOLO en columna H
    rowSubtotal.getCell(8).value = `${numParcelas} Parcela${numParcelas > 1 ? 's' : ''}`; // H
    rowSubtotal.getCell(9).value = superficieTotal.toFixed(2); // I: Total área

    // Agregar fórmulas SUM para columnas L-AL (cultivos de las 3 gestiones)
    // Columnas 12-38 = L-AL (gestión pasada + actual + futura)
    for (let col = 12; col <= 38; col++) {
      const letra = this.numeroALetra(col);
      // Sumar desde filaInicio hasta filaFinParcelas (todas las filas de parcelas)
      rowSubtotal.getCell(col).value = {
        formula: `SUM(${letra}${filaInicio}:${letra}${filaFinParcelas})`
      };
    }

    // Aplicar estilo al subtotal
    rowSubtotal.font = { bold: true, size: 10 };

    // Aplicar color gris y centrado SOLO a columnas H-AL (8-38)
    // NO aplicar color a A-G (1-7) ni AM-AR (39-44) porque están combinadas con datos del productor
    for (let col = 8; col <= 38; col++) {
      const cell = rowSubtotal.getCell(col);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }, // Gris claro
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }

    // Agregar bordes y centrado a toda la fila de subtotal
    for (let col = 1; col <= 44; col++) {
      const cell = rowSubtotal.getCell(col);
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };
      // Centrar también columnas A-G y AM-AR
      if (col <= 7 || col >= 39) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    }

    return filaSubtotal + 1;
  }

  // Escribe los headers principales (filas 1-3)
  private escribirHeadersPrincipales(worksheet: ExcelJS.Worksheet, gestionActual: number, categoria: string): void {
    // Fila 1: Titulo principal
    worksheet.mergeCells("A1:K1");
    const celda1 = worksheet.getCell("A1");
    celda1.value = "LISTA DE PRODUCTORES ORGANICOS";
    celda1.font = { bold: true, size: 18 };
    celda1.alignment = { horizontal: "left", vertical: "middle" };

    // Fila 2: Periodo de certificación
    worksheet.mergeCells("A2:K2");
    const celda2 = worksheet.getCell("A2");
    celda2.value = `PERIODO DE CERTIFICACIÓN GESTION ${gestionActual}`;
    celda2.font = { bold: true, size: 18 };
    celda2.alignment = { horizontal: "left", vertical: "middle" };

    // Fila 3: Categoria
    worksheet.mergeCells("A3:K3");
    const celda3 = worksheet.getCell("A3");
    celda3.value = `CATEGORIA ${categoria}`;
    celda3.font = { bold: true, size: 18 };
    celda3.alignment = { horizontal: "left", vertical: "middle" };
  }

  // Escribe los headers de gestión con merge (fila 5)
  private escribirHeadersGestion(
    worksheet: ExcelJS.Worksheet,
    gestionPasada: number,
    gestionActual: number,
    gestionFutura: number
  ): void {
    const fila = 5;

    // Colores para los años de gestión
    const colorGestionPasada = "FFc4d79b"; // RGB(196, 215, 155) - Verde manzana suave
    const colorGestionActual = "FF92d050"; // RGB(146, 208, 80) - Verde lima brillante
    const colorGestionFutura = "FFfcd5b4"; // RGB(252, 213, 180) - Durazno claro
    const colorGris = "FFD3D3D3"; // Gris claro

    // Columnas A-I: Sin header de gestión (datos básicos del productor)

    // Columnas J-K: Coordenadas (10-11: 2 columnas)
    // NO combinamos horizontalmente aquí porque se combinará verticalmente en combinarColumnasVerticales (J5:K6)
    // Solo escribimos el texto en J5, la combinación J5:K6 se hará después
    const celdaCoordenadas = worksheet.getCell(`J${fila}`);
    celdaCoordenadas.value = "Coordenadas";
    celdaCoordenadas.font = { bold: true, color: { argb: "FF000000" } }; // Texto negro
    celdaCoordenadas.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    celdaCoordenadas.alignment = { horizontal: "center", vertical: "middle" };
    celdaCoordenadas.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // También aplicar estilo a K5 para que cuando se combine J5:K6 quede bien
    const celdaK = worksheet.getCell(`K${fila}`);
    celdaK.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    celdaK.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas L-T: Gestión pasada (12-20: 9 columnas)
    worksheet.mergeCells(`L${fila}:T${fila}`);
    const celdaPasada = worksheet.getCell(`L${fila}`);
    celdaPasada.value = `${gestionPasada}`;
    celdaPasada.font = { bold: true, color: { argb: "FF000000" } }; // Texto negro
    celdaPasada.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGestionPasada },
    };
    celdaPasada.alignment = { horizontal: "center", vertical: "middle" };
    celdaPasada.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas U-AD: Gestión actual (21-30: 10 columnas)
    worksheet.mergeCells(`U${fila}:AD${fila}`);
    const celdaActual = worksheet.getCell(`U${fila}`);
    celdaActual.value = `${gestionActual}`;
    celdaActual.font = { bold: true, color: { argb: "FF000000" } }; // Texto negro
    celdaActual.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGestionActual },
    };
    celdaActual.alignment = { horizontal: "center", vertical: "middle" };
    celdaActual.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas AE-AL: Planificación futura (31-38: 8 columnas)
    worksheet.mergeCells(`AE${fila}:AL${fila}`);
    const celdaFutura = worksheet.getCell(`AE${fila}`);
    celdaFutura.value = `PLANIFICACION ${gestionFutura}`;
    celdaFutura.font = { bold: true, color: { argb: "FF000000" } }; // Texto negro
    celdaFutura.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGestionFutura },
    };
    celdaFutura.alignment = { horizontal: "center", vertical: "middle" };
    celdaFutura.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas AM-AR: Sin header de gestión (datos de ficha)
  }

  // Escribe la fila de temporada (fila 6)
  private escribirFilaTemporada(worksheet: ExcelJS.Worksheet): void {
    const fila = 6;
    const colorGris = "FFD3D3D3"; // Gris claro

    // Columnas A-K: Sin texto de temporada (datos básicos del productor)

    // Columnas L-T: Temporada para gestión pasada (12-20: 9 columnas)
    worksheet.mergeCells(`L${fila}:T${fila}`);
    const celdaPasada = worksheet.getCell(`L${fila}`);
    celdaPasada.value = "Verano (Septiembre - Marzo)";
    celdaPasada.font = { bold: true, color: { argb: "FF000000" } };
    celdaPasada.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    celdaPasada.alignment = { horizontal: "center", vertical: "middle" };
    celdaPasada.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas U-AD: Temporada para gestión actual (21-30: 10 columnas)
    worksheet.mergeCells(`U${fila}:AD${fila}`);
    const celdaActual = worksheet.getCell(`U${fila}`);
    celdaActual.value = "Verano (Septiembre - Marzo)";
    celdaActual.font = { bold: true, color: { argb: "FF000000" } };
    celdaActual.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    celdaActual.alignment = { horizontal: "center", vertical: "middle" };
    celdaActual.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas AE-AL: Temporada para planificación futura (31-38: 8 columnas)
    worksheet.mergeCells(`AE${fila}:AL${fila}`);
    const celdaFutura = worksheet.getCell(`AE${fila}`);
    celdaFutura.value = "Verano (Septiembre - Marzo)";
    celdaFutura.font = { bold: true, color: { argb: "FF000000" } };
    celdaFutura.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    celdaFutura.alignment = { horizontal: "center", vertical: "middle" };
    celdaFutura.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Columnas AM-AR: Sin texto de temporada (datos de ficha)
  }

  // Escribe los headers de columnas (fila 7)
  private escribirHeadersColumnas(worksheet: ExcelJS.Worksheet, cultivoCertificable: string): void {
    const fila = 7;
    const headers = [
      "No.", // A
      "Código", // B
      "Organización", // C
      "Nombre y apellido", // D
      "C.I.", // E
      "Comunidad", // F
      "Provincia", // G
      "Identificación de parcelas", // H
      "Área Parcela Actual (ha)", // I
      "Latitud Sud", // J
      "Longitud Oeste", // K
      // Gestión pasada (L-T)
      "Maní", // L
      "Maíz", // M
      "Papa", // N
      "Ají", // O
      "Leguminosa", // P
      "Otros", // Q
      "Descanso", // R
      "Total Areas (has)", // S
      "Prod. Real Maní qq", // T
      // Gestión actual (U-AD)
      "Maní", // U
      "Maíz", // V
      "Papa", // W
      "Ají", // X
      "Leguminosa", // Y
      "Otros", // Z
      "Descanso", // AA
      "Total Areas (has)", // AB
      "Prod. Estim. Maní qq", // AC
      "Prod. Real Maní qq", // AD
      // Planificación futura (AE-AL)
      "Maní", // AE
      "Maíz", // AF
      "Papa", // AG
      "Ají", // AH
      "Leguminosa", // AI
      "Otros", // AJ
      "Descanso", // AK
      "Total Areas (has)", // AL
      // Datos de ficha (AM-AR)
      "Inicio de conversión a productor orgánico", // AM
      "Fecha de inspección interna", // AN
      "Inspector interno", // AO
      "Estatus propuesto", // AP
      "No conformidades", // AQ
      "Acciones correctivas", // AR
    ];

    // Colores
    const colorCertificable = "FF228B22"; // Verde oscuro (cultivo certificable)
    const colorProdEstim = "FF90EE90"; // Verde pálido (Prod. Estim.)
    const colorProdReal = "FFFFA500"; // Naranja (Prod. Real)
    const colorGrisGeneral = "FFD3D3D3"; // Gris claro (columnas generales)

    const row = worksheet.getRow(fila);
    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      const colNum = index + 1;

      cell.value = header;
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

      // Determinar si debe tener color de fondo
      let colorFondo: string | null = null;

      // Columnas A-K (1-11): datos generales - gris claro
      if (colNum >= 1 && colNum <= 11) {
        colorFondo = colorGrisGeneral;
      }
      // Columnas L-T (12-20): Gestión Pasada
      else if (colNum >= 12 && colNum <= 20) {
        if (header === cultivoCertificable) {
          colorFondo = colorCertificable; // Cultivo certificable
        } else if (header.includes("Prod. Real")) {
          colorFondo = colorProdReal; // Prod. Real
        }
        // Los demás cultivos sin color de fondo
      }
      // Columnas U-AD (21-30): Gestión Actual
      else if (colNum >= 21 && colNum <= 30) {
        if (header === cultivoCertificable) {
          colorFondo = colorCertificable; // Cultivo certificable
        } else if (header.includes("Prod. Estim.")) {
          colorFondo = colorProdEstim; // Prod. Estim.
        } else if (header.includes("Prod. Real")) {
          colorFondo = colorProdReal; // Prod. Real
        }
        // Los demás cultivos sin color de fondo
      }
      // Columnas AE-AL (31-38): Gestión Futura
      else if (colNum >= 31 && colNum <= 38) {
        if (header === cultivoCertificable) {
          colorFondo = colorCertificable; // Cultivo certificable
        }
        // Los demás cultivos sin color de fondo
      }
      // Columnas AM-AR (39-44): datos de ficha - gris claro
      else if (colNum >= 39 && colNum <= 44) {
        colorFondo = colorGrisGeneral;
      }

      // Aplicar color de fondo si existe
      if (colorFondo) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorFondo },
        };
      }

      // Siempre aplicar bordes
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    row.height = 40;
  }

  // Combina verticalmente las columnas que no tienen años de gestión ni temporada
  private combinarColumnasVerticales(worksheet: ExcelJS.Worksheet): void {
    const colorGrisGeneral = "FFD3D3D3"; // Gris claro

    // Columnas A-I (1-9): datos básicos del productor
    // Mover contenido de fila 7 a fila 5, luego combinar
    const columnasBasicas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    for (const col of columnasBasicas) {
      // Obtener el valor y estilo de la fila 7
      const celdaFila7 = worksheet.getCell(`${col}7`);
      const valor = celdaFila7.value;
      const font = celdaFila7.font;
      const border = celdaFila7.border;
      const fill = celdaFila7.fill;

      // Combinar de 5 a 7
      worksheet.mergeCells(`${col}5:${col}7`);

      // Aplicar el valor y estilos a la celda combinada (fila 5)
      const celdaCombinada = worksheet.getCell(`${col}5`);
      celdaCombinada.value = valor;
      celdaCombinada.font = font;
      celdaCombinada.fill = fill || {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorGrisGeneral },
      };
      celdaCombinada.border = border;
      celdaCombinada.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    }

    // Columnas J-K: Coordenadas (combinado horizontal en fila 5)
    // Necesita combinarse verticalmente de fila 5 a fila 6 (en fila 7 están Latitud/Longitud)
    // La celda J5 ya está combinada horizontalmente (J5:K5) desde escribirHeadersGestion
    // Solo necesitamos combinar verticalmente esa celda combinada
    worksheet.mergeCells('J5:K6');
    const celdaCoordenadas = worksheet.getCell('J5');
    celdaCoordenadas.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // Columnas AM-AR (39-44): datos de ficha
    const columnasFicha = ['AM', 'AN', 'AO', 'AP', 'AQ', 'AR'];

    for (const col of columnasFicha) {
      // Obtener el valor y estilo de la fila 7
      const celdaFila7 = worksheet.getCell(`${col}7`);
      const valor = celdaFila7.value;
      const font = celdaFila7.font;
      const border = celdaFila7.border;
      const fill = celdaFila7.fill;

      // Combinar de 5 a 7
      worksheet.mergeCells(`${col}5:${col}7`);

      // Aplicar el valor y estilos a la celda combinada (fila 5)
      const celdaCombinada = worksheet.getCell(`${col}5`);
      celdaCombinada.value = valor;
      celdaCombinada.font = font;
      celdaCombinada.fill = fill || {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorGrisGeneral },
      };
      celdaCombinada.border = border;
      celdaCombinada.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    }
  }

  // Escribe la fila TOTAL COMUNIDAD
  private escribirTotalComunidad(
    worksheet: ExcelJS.Worksheet,
    filaActual: number,
    nombreComunidad: string,
    filaInicio: number,
    filaFin: number,
    colorFondo: string
  ): void {
    const row = worksheet.getRow(filaActual);

    // Combinar A-G para el texto del total de comunidad
    worksheet.mergeCells(`A${filaActual}:G${filaActual}`);
    row.getCell(1).value = `TOTAL ${nombreComunidad.toUpperCase()}`;

    // I: Suma de áreas (solo sumar filas que NO sean subtotales)
    row.getCell(9).value = { formula: `SUMIF(H${filaInicio}:H${filaFin},"<>*Parcela*",I${filaInicio}:I${filaFin})` };

    // FIX: Agregar fórmulas SUM para columnas L-AL (cultivos de las 3 gestiones)
    // Sumamos SOLO las filas "X Parcelas" (subtotales de productores)
    // Columnas 12-38 = L-AL
    for (let col = 12; col <= 38; col++) {
      const letra = this.numeroALetra(col);
      // SUMIF: Sumar solo filas donde columna H contiene "Parcela"
      row.getCell(col).value = {
        formula: `SUMIF(H${filaInicio}:H${filaFin},"*Parcela*",${letra}${filaInicio}:${letra}${filaFin})`
      };
    }

    // Aplicar estilos solo a columnas de la tabla (1-44)
    row.font = { bold: true };

    const borderStyle: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF000000" } };
    for (let col = 1; col <= 44; col++) {
      const cell = row.getCell(col);

      // Aplicar color de gestión futura (durazno claro)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorFondo },
      };

      // Centrar contenido
      cell.alignment = { horizontal: "center", vertical: "middle" };

      // Agregar bordes
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };
    }
  }

  // Escribe la fila TOTAL GENERAL
  private escribirTotalGeneral(
    worksheet: ExcelJS.Worksheet,
    filaActual: number,
    filasTotales: number[],
    colorFondo: string
  ): void {
    const row = worksheet.getRow(filaActual);

    // Combinar A-G para el texto del total general
    worksheet.mergeCells(`A${filaActual}:G${filaActual}`);
    row.getCell(1).value = "TOTAL COMUNIDADES";

    // I: Suma de áreas de todos los totales de comunidades
    const referencias = filasTotales.map((f) => `I${f}`).join("+");
    row.getCell(9).value = { formula: referencias };

    // FIX: Agregar fórmulas SUM para columnas L-AL (cultivos de las 3 gestiones)
    // Sumamos todas las filas "TOTAL COMUNIDAD"
    // Columnas 12-38 = L-AL
    for (let col = 12; col <= 38; col++) {
      const letra = this.numeroALetra(col);
      // Sumar las celdas de los totales de comunidades para esta columna
      const referenciasCol = filasTotales.map((f) => `${letra}${f}`).join("+");
      row.getCell(col).value = { formula: referenciasCol };
    }

    // Aplicar estilos solo a columnas de la tabla (1-44)
    row.font = { bold: true, size: 12 };

    const borderStyle: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF000000" } };
    for (let col = 1; col <= 44; col++) {
      const cell = row.getCell(col);

      // Aplicar color de gestión pasada (verde manzana suave)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorFondo },
      };

      // Centrar contenido
      cell.alignment = { horizontal: "center", vertical: "middle" };

      // Agregar bordes
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };
    }
  }

  // Aplica estilos y anchos de columnas
  private aplicarEstilos(worksheet: ExcelJS.Worksheet): void {
    // Anchos de columnas
    worksheet.getColumn(1).width = 5; // A: No.
    worksheet.getColumn(2).width = 12; // B: Código
    worksheet.getColumn(3).width = 15; // C: Organización
    worksheet.getColumn(4).width = 25; // D: Nombre
    worksheet.getColumn(5).width = 12; // E: C.I.
    worksheet.getColumn(6).width = 18; // F: Comunidad
    worksheet.getColumn(7).width = 18; // G: Provincia
    worksheet.getColumn(8).width = 10; // H: Identificación parcelas
    worksheet.getColumn(9).width = 12; // I: Área
    worksheet.getColumn(10).width = 12; // J: Latitud
    worksheet.getColumn(11).width = 12; // K: Longitud

    // Columnas de cultivos (L-AL: 12-38)
    for (let i = 12; i <= 38; i++) {
      worksheet.getColumn(i).width = 10;
    }

    // Columnas de ficha (AM-AR: 39-44)
    worksheet.getColumn(39).width = 15; // AM: Inicio conversión
    worksheet.getColumn(40).width = 15; // AN: Fecha inspección
    worksheet.getColumn(41).width = 18; // AO: Inspector
    worksheet.getColumn(42).width = 12; // AP: Estatus
    worksheet.getColumn(43).width = 30; // AQ: No conformidades
    worksheet.getColumn(44).width = 30; // AR: Acciones

    // Formato de números con 2 decimales para columnas de superficie
    worksheet.getColumn(9).numFmt = "0.00"; // Área
  }

  // Convierte número de columna a letra (1=A, 2=B, ... , 27=AA, etc.)
  private numeroALetra(num: number): string {
    let letra = "";
    while (num > 0) {
      const resto = (num - 1) % 26;
      letra = String.fromCharCode(65 + resto) + letra;
      num = Math.floor((num - resto) / 26);
    }
    return letra;
  }
}
