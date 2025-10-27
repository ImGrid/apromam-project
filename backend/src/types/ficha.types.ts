// Types y enums para el sistema de fichas de inspección
// Centraliza todas las interfaces de las tablas relacionadas

// Enums de estados y valores fijos

export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

export type EstadoFicha = "borrador" | "revision" | "aprobado" | "rechazado";

export type ResultadoCertificacion = "aprobado" | "rechazado" | "pendiente";

export type OrigenCaptura = "online" | "offline";

export type EstadoSync = "pendiente" | "sincronizado" | "conflicto";

export type CategoriaProductor = "E" | "2T" | "1T" | "0T";

export type ProcedenciaSemilla =
  | "asociacion"
  | "propia"
  | "otro_productor"
  | "no_sembro";

export type CategoriaSemilla =
  | "organica"
  | "transicion"
  | "convencional"
  | "ninguna";

export type TratamientoSemillas =
  | "sin_tratamiento"
  | "agroquimico"
  | "insumos_organicos"
  | "otro";

export type TipoAbonamiento = "rastrojo" | "guano" | "otro";

export type MetodoAporque = "con_yunta" | "manual" | "otro";

export type ControlHierbas = "con_bueyes" | "carpida_manual" | "otro";

export type MetodoCosecha = "con_yunta" | "manual" | "otro";

export type TipoGanado = "mayor" | "menor" | "aves";

export type TipoArchivo = "croquis" | "foto_parcela" | "documento_pdf";

export type EstadoUpload = "pendiente" | "subido" | "error";

// Interfaces para tablas hijas de ficha_inspeccion

// Sección 2: Revisión de documentación
export interface RevisionDocumentacionData {
  id_revision: string;
  id_ficha: string;
  solicitud_ingreso: ComplianceStatus;
  normas_reglamentos: ComplianceStatus;
  contrato_produccion: ComplianceStatus;
  croquis_unidad: ComplianceStatus;
  diario_campo: ComplianceStatus;
  registro_cosecha: ComplianceStatus;
  recibo_pago: ComplianceStatus;
  observaciones_documentacion?: string;
}

// Sección 3: Acciones correctivas de gestión anterior
export interface AccionCorrectivaData {
  id_accion: string;
  id_ficha: string;
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string;
  created_at: Date;
}

// Sección 11: No conformidades de gestión presente
export interface NoConformidadData {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string;
  fecha_limite_implementacion?: Date;
  estado_conformidad: string;
  created_at: Date;
}

// Sección 5: Evaluación de mitigación
export interface EvaluacionMitigacionData {
  id_evaluacion: string;
  id_ficha: string;
  practica_mitigacion_riesgos: ComplianceStatus;
  mitigacion_contaminacion: ComplianceStatus;
  deposito_herramientas: ComplianceStatus;
  deposito_insumos_organicos: ComplianceStatus;
  evita_quema_residuos: ComplianceStatus;
  practica_mitigacion_riesgos_descripcion?: string;
  mitigacion_contaminacion_descripcion?: string;
}

// Sección 9: Evaluación de poscosecha
export interface EvaluacionPoscosechaData {
  id_evaluacion_poscosecha: string;
  id_ficha: string;
  secado_tendal: ComplianceStatus;
  envases_limpios: ComplianceStatus;
  almacen_protegido: ComplianceStatus;
  evidencia_comercializacion: ComplianceStatus;
  comentarios_poscosecha?: string;
}

// Sección 10: Evaluación conocimiento normas
export interface EvaluacionConocimientoNormasData {
  id_evaluacion_conocimiento: string;
  id_ficha: string;
  conoce_normas_organicas: ComplianceStatus;
  recibio_capacitacion: ComplianceStatus;
  comentarios_conocimiento?: string;
}

// Sección 6: Actividad pecuaria
export interface ActividadPecuariaData {
  id_actividad: string;
  id_ficha: string;
  tipo_ganado: TipoGanado;
  animal_especifico?: string;
  cantidad: number;
  sistema_manejo?: string;
  uso_guano?: string;
  created_at: Date;
}

// Sección 4/7: Detalle cultivo por parcela
// IMPORTAR desde entities/DetalleCultivoParcela.ts - NO duplicar aquí
import type { DetalleCultivoParcelaData } from "../entities/DetalleCultivoParcela.js";
export type { DetalleCultivoParcelaData };

// Sección 8: Cosecha y ventas
export interface CosechaVentasData {
  id_cosecha: string;
  id_ficha: string;
  id_tipo_cultivo: string;
  superficie_actual_ha: number;
  cosecha_estimada_qq: number;
  numero_parcelas: number;
  destino_consumo_qq: number;
  destino_semilla_qq: number;
  destino_ventas_qq: number;
  observaciones?: string;
  created_at: Date;
  // Datos enriquecidos
  nombre_cultivo?: string;
}

// Archivos adjuntos (fotos, croquis, PDFs)
export interface ArchivoFichaData {
  id_archivo: string;
  id_ficha: string;
  tipo_archivo: TipoArchivo;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type?: string;
  estado_upload: EstadoUpload;
  hash_archivo?: string;
  fecha_captura: Date;
  created_at: Date;
}

// Ficha principal (tabla madre)
export interface FichaData {
  id_ficha: string;
  codigo_productor: string;
  gestion: number;
  fecha_inspeccion: Date;
  inspector_interno: string;
  persona_entrevistada?: string;
  categoria_gestion_anterior?: CategoriaProductor;

  // Control PWA
  origen_captura: OrigenCaptura;
  fecha_sincronizacion?: Date;
  estado_sync: EstadoSync;

  // Workflow
  estado_ficha: EstadoFicha;
  resultado_certificacion: ResultadoCertificacion;

  // Contenido final
  comentarios_evaluacion?: string;

  // Auditoría
  created_by: string;
  created_at: Date;
  updated_at: Date;

  // Datos enriquecidos por JOINs
  nombre_productor?: string;
  nombre_comunidad?: string;
  nombre_creador?: string;
}

// Input para crear ficha completa con todas sus secciones
export interface CreateFichaCompletaInput {
  // Datos básicos
  ficha: {
    codigo_productor: string;
    gestion: number;
    fecha_inspeccion: Date;
    inspector_interno: string;
    persona_entrevistada?: string;
    categoria_gestion_anterior?: CategoriaProductor;
    origen_captura?: OrigenCaptura;
  };

  // Secciones evaluativas (opcionales en borrador)
  revision_documentacion?: Omit<
    RevisionDocumentacionData,
    "id_revision" | "id_ficha"
  >;
  evaluacion_mitigacion?: Omit<
    EvaluacionMitigacionData,
    "id_evaluacion" | "id_ficha"
  >;
  evaluacion_poscosecha?: Omit<
    EvaluacionPoscosechaData,
    "id_evaluacion_poscosecha" | "id_ficha"
  >;
  evaluacion_conocimiento_normas?: Omit<
    EvaluacionConocimientoNormasData,
    "id_evaluacion_conocimiento" | "id_ficha"
  >;

  // Arrays de datos (opcionales)
  acciones_correctivas?: Omit<
    AccionCorrectivaData,
    "id_accion" | "id_ficha" | "created_at"
  >[];
  no_conformidades?: Omit<
    NoConformidadData,
    "id_no_conformidad" | "id_ficha" | "created_at"
  >[];
  actividades_pecuarias?: Omit<
    ActividadPecuariaData,
    "id_actividad" | "id_ficha" | "created_at"
  >[];
  detalle_cultivos_parcelas?: Omit<
    DetalleCultivoParcelaData,
    "id_detalle" | "id_ficha" | "created_at"
  >[];
  cosecha_ventas?: Omit<
    CosechaVentasData,
    "id_cosecha" | "id_ficha" | "created_at"
  >[];

  // Contenido final (solo en envío a revisión)
  comentarios_evaluacion?: string;
}

// Input para actualizar ficha (similar pero todo opcional)
export interface UpdateFichaCompletaInput {
  ficha?: Partial<CreateFichaCompletaInput["ficha"]>;
  revision_documentacion?: Partial<
    Omit<RevisionDocumentacionData, "id_revision" | "id_ficha">
  >;
  evaluacion_mitigacion?: Partial<
    Omit<EvaluacionMitigacionData, "id_evaluacion" | "id_ficha">
  >;
  evaluacion_poscosecha?: Partial<
    Omit<EvaluacionPoscosechaData, "id_evaluacion_poscosecha" | "id_ficha">
  >;
  evaluacion_conocimiento_normas?: Partial<
    Omit<
      EvaluacionConocimientoNormasData,
      "id_evaluacion_conocimiento" | "id_ficha"
    >
  >;
  acciones_correctivas?: Omit<
    AccionCorrectivaData,
    "id_accion" | "id_ficha" | "created_at"
  >[];
  no_conformidades?: Omit<
    NoConformidadData,
    "id_no_conformidad" | "id_ficha" | "created_at"
  >[];
  actividades_pecuarias?: Omit<
    ActividadPecuariaData,
    "id_actividad" | "id_ficha" | "created_at"
  >[];
  detalle_cultivos_parcelas?: Omit<
    DetalleCultivoParcelaData,
    "id_detalle" | "id_ficha" | "created_at"
  >[];
  cosecha_ventas?: Omit<
    CosechaVentasData,
    "id_cosecha" | "id_ficha" | "created_at"
  >[];
  comentarios_evaluacion?: string;
}

// Response público para API
export interface FichaPublicData {
  id_ficha: string;
  codigo_productor: string;
  nombre_productor?: string;
  nombre_comunidad?: string;
  gestion: number;
  fecha_inspeccion: string;
  inspector_interno: string;
  persona_entrevistada?: string;
  categoria_gestion_anterior?: CategoriaProductor;
  estado_ficha: EstadoFicha;
  resultado_certificacion: ResultadoCertificacion;
  origen_captura: OrigenCaptura;
  estado_sync: EstadoSync;
  created_at: string;
  updated_at: string;
}
