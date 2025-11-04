/**
 * Types para el sistema de Fichas de Inspección
 * Basados en las entidades del backend
 */

// ============================================
// ENUMS Y TIPOS BASICOS
// ============================================

export type CategoriaGestion = "E" | "T2" | "T1" | "T0";
export type OrigenCaptura = "online" | "offline";
export type EstadoSync = "pendiente" | "sincronizado" | "conflicto";
export type EstadoFicha = "borrador" | "revision" | "aprobado" | "rechazado";
export type ResultadoCertificacion = "aprobado" | "rechazado" | "pendiente";
export type ComplianceStatus = "cumple" | "parcial" | "no_cumple" | "no_aplica";

// Tipos para Sección 7 - Manejo del cultivo (basados en documento oficial)
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
  | "insumos_organicos";
export type TipoAbonamiento = "rastrojo" | "guano" | "otro";
export type MetodoAporque = "con_yunta" | "manual" | "otro";
export type ControlHierbas = "con_bueyes" | "carpida_manual" | "otro";
export type MetodoCosecha = "con_yunta" | "manual" | "otro";

// Tipo para Sección 8 - Cosecha y Ventas
export type TipoMani = "ecologico" | "transicion";

// Tipo para barreras de parcelas
export type TipoBarrera = "viva" | "muerta" | "ninguna";

// ============================================
// FICHA PRINCIPAL
// ============================================

export interface Ficha {
  id_ficha: string;
  codigo_productor: string;
  gestion: number;
  fecha_inspeccion: string;
  inspector_interno: string;
  persona_entrevistada?: string;
  categoria_gestion_anterior?: CategoriaGestion;

  // Control PWA
  origen_captura: OrigenCaptura;
  fecha_sincronizacion?: string;
  estado_sync: EstadoSync;

  // Workflow
  estado_ficha: EstadoFicha;
  resultado_certificacion: ResultadoCertificacion;

  // Contenido
  comentarios_actividad_pecuaria?: string;
  comentarios_evaluacion?: string;

  // Auditoria
  created_by: string;
  created_at: string;
  updated_at: string;

  // Datos enriquecidos
  nombre_productor?: string;
  nombre_comunidad?: string;
}

export interface CreateFichaInput {
  codigo_productor: string;
  gestion: number;
  fecha_inspeccion: string;
  inspector_interno: string;
  persona_entrevistada?: string;
  categoria_gestion_anterior?: CategoriaGestion;
  origen_captura?: OrigenCaptura;
  comentarios_actividad_pecuaria?: string;
}

export interface UpdateFichaInput {
  fecha_inspeccion?: string;
  inspector_interno?: string;
  persona_entrevistada?: string;
  categoria_gestion_anterior?: CategoriaGestion;
  comentarios_actividad_pecuaria?: string;
  comentarios_evaluacion?: string;
}

// ============================================
// REVISION DOCUMENTACION (Sección 2)
// ============================================

export interface RevisionDocumentacion {
  id_revision: string;
  id_ficha: string;
  solicitud_ingreso: ComplianceStatus;
  normas_reglamentos: ComplianceStatus;
  contrato_produccion: ComplianceStatus;
  croquis_unidad: ComplianceStatus;
  diario_campo: ComplianceStatus;
  registro_cosecha: ComplianceStatus;
  recibo_pago: ComplianceStatus;
}

export interface CreateRevisionDocumentacionInput {
  solicitud_ingreso?: ComplianceStatus;
  normas_reglamentos?: ComplianceStatus;
  contrato_produccion?: ComplianceStatus;
  croquis_unidad?: ComplianceStatus;
  diario_campo?: ComplianceStatus;
  registro_cosecha?: ComplianceStatus;
  recibo_pago?: ComplianceStatus;
}

// ============================================
// ACCIONES CORRECTIVAS (Sección 3)
// ============================================

export interface AccionCorrectiva {
  id_accion: string;
  id_ficha: string;
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string;
  created_at: string;
}

export interface CreateAccionCorrectivaInput {
  numero_accion: number;
  descripcion_accion: string;
  implementacion_descripcion?: string;
}

// ============================================
// NO CONFORMIDADES (Sección 11)
// ============================================

export interface NoConformidad {
  id_no_conformidad: string;
  id_ficha: string;
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string;
  fecha_limite_implementacion?: string;
  created_at: string;
}

export interface CreateNoConformidadInput {
  descripcion_no_conformidad: string;
  accion_correctiva_propuesta?: string;
  fecha_limite_implementacion?: string;
}

// ============================================
// EVALUACION MITIGACION (Sección 5)
// ============================================

export interface EvaluacionMitigacion {
  id_evaluacion: string;
  id_ficha: string;
  practica_mitigacion_riesgos: ComplianceStatus;
  mitigacion_contaminacion: ComplianceStatus;
  deposito_herramientas: ComplianceStatus;
  deposito_insumos_organicos: ComplianceStatus;
  evita_quema_residuos: ComplianceStatus;
  practica_mitigacion_riesgos_descripcion?: string;
  mitigacion_contaminacion_descripcion?: string;
  comentarios_sobre_practica_mitigacion?: string;
}

export interface CreateEvaluacionMitigacionInput {
  practica_mitigacion_riesgos?: ComplianceStatus;
  mitigacion_contaminacion?: ComplianceStatus;
  deposito_herramientas?: ComplianceStatus;
  deposito_insumos_organicos?: ComplianceStatus;
  evita_quema_residuos?: ComplianceStatus;
  practica_mitigacion_riesgos_descripcion?: string;
  mitigacion_contaminacion_descripcion?: string;
  comentarios_sobre_practica_mitigacion?: string;
}

// ============================================
// EVALUACION POSCOSECHA (Sección 9)
// ============================================

export interface EvaluacionPoscosecha {
  id_evaluacion: string;
  id_ficha: string;
  secado_tendal: ComplianceStatus;
  envases_limpios: ComplianceStatus;
  almacen_protegido: ComplianceStatus;
  evidencia_comercializacion: ComplianceStatus;
  comentarios_poscosecha?: string;
}

export interface CreateEvaluacionPoscosechaInput {
  secado_tendal?: ComplianceStatus;
  envases_limpios?: ComplianceStatus;
  almacen_protegido?: ComplianceStatus;
  evidencia_comercializacion?: ComplianceStatus;
  comentarios_poscosecha?: string;
}

// ============================================
// EVALUACION CONOCIMIENTO NORMAS (Sección 10)
// ============================================

export interface EvaluacionConocimientoNormas {
  id_evaluacion: string;
  id_ficha: string;
  conoce_normas_organicas: ComplianceStatus;
  recibio_capacitacion: ComplianceStatus;
  comentarios_conocimiento?: string;
}

export interface CreateEvaluacionConocimientoInput {
  conoce_normas_organicas?: ComplianceStatus;
  recibio_capacitacion?: ComplianceStatus;
  comentarios_conocimiento?: string;
}

// ============================================
// ACTIVIDAD PECUARIA (Sección 6)
// ============================================

export interface ActividadPecuaria {
  id_actividad: string;
  id_ficha: string;
  tipo_ganado: string;
  animal_especifico?: string;
  cantidad: number;
  sistema_manejo?: string;
  uso_guano?: string;
  created_at: string;
}

export interface CreateActividadPecuariaInput {
  tipo_ganado: string;
  animal_especifico?: string;
  cantidad: number;
  sistema_manejo?: string;
  uso_guano?: string;
}

// ============================================
// DETALLE CULTIVO PARCELA (Sección 4/7)
// ============================================

export interface DetalleCultivoParcela {
  id_detalle: string;
  id_ficha: string;
  id_parcela: string;
  id_tipo_cultivo: string;
  superficie_ha: number;
  procedencia_semilla?: ProcedenciaSemilla;
  categoria_semilla?: CategoriaSemilla;
  tratamiento_semillas?: TratamientoSemillas;
  tipo_abonamiento?: TipoAbonamiento;
  tipo_abonamiento_otro?: string;
  metodo_aporque?: MetodoAporque;
  metodo_aporque_otro?: string;
  control_hierbas?: ControlHierbas;
  control_hierbas_otro?: string;
  metodo_cosecha?: MetodoCosecha;
  metodo_cosecha_otro?: string;
  situacion_actual?: string;
  created_at: string;

  // Datos enriquecidos (JOINs con parcelas y tipos_cultivo)
  nombre_parcela?: string;
  nombre_cultivo?: string;
  es_principal_certificable?: boolean;
  numero_parcela?: number;
  rotacion?: boolean;
  utiliza_riego?: boolean;
  tipo_barrera?: TipoBarrera;
  insumos_organicos?: string;
  latitud_sud?: number;
  longitud_oeste?: number;
}

export interface CreateDetalleCultivoParcelaInput {
  id_parcela: string;
  id_tipo_cultivo: string;
  superficie_ha: number;
  procedencia_semilla?: ProcedenciaSemilla;
  categoria_semilla?: CategoriaSemilla;
  tratamiento_semillas?: TratamientoSemillas;
  tipo_abonamiento?: TipoAbonamiento;
  tipo_abonamiento_otro?: string;
  metodo_aporque?: MetodoAporque;
  metodo_aporque_otro?: string;
  control_hierbas?: ControlHierbas;
  control_hierbas_otro?: string;
  metodo_cosecha?: MetodoCosecha;
  metodo_cosecha_otro?: string;
  situacion_actual?: string;
}

// ============================================
// PARCELAS INSPECCIONADAS (Datos actualizados en parcelas)
// ============================================

export interface ParcelaInspeccionada {
  id_parcela: string;
  rotacion?: boolean;
  utiliza_riego?: boolean;
  tipo_barrera?: TipoBarrera;
  insumos_organicos?: string;
  latitud_sud?: number;
  longitud_oeste?: number;
}

export interface CreateParcelaInspeccionadaInput {
  id_parcela: string;
  rotacion?: boolean;
  utiliza_riego?: boolean;
  tipo_barrera?: TipoBarrera;
  insumos_organicos?: string;
  latitud_sud?: number;
  longitud_oeste?: number;
}

// ============================================
// COSECHA Y VENTAS (Sección 8)
// ============================================

export interface CosechaVentas {
  id_cosecha: string;
  id_ficha: string;
  tipo_mani: TipoMani;
  superficie_actual_ha: number;
  cosecha_estimada_qq: number;
  numero_parcelas: number;
  destino_consumo_qq: number;
  destino_semilla_qq: number;
  destino_ventas_qq: number;
  observaciones?: string;
  created_at: string;
}

export interface CreateCosechaVentasInput {
  tipo_mani: TipoMani;
  superficie_actual_ha: number;
  cosecha_estimada_qq: number;
  numero_parcelas: number;
  destino_consumo_qq: number;
  destino_semilla_qq: number;
  destino_ventas_qq: number;
  observaciones?: string;
}

// ============================================
// ARCHIVOS FICHA (Adjuntos)
// ============================================

export interface ArchivoFicha {
  id_archivo: string;
  id_ficha: string;
  tipo_archivo: string;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type: string;
  estado_upload: string;
  hash_archivo?: string;
  fecha_captura?: string;
  created_at: string;
}

export interface CreateArchivoFichaInput {
  tipo_archivo: string;
  nombre_original: string;
  ruta_almacenamiento: string;
  tamaño_bytes: number;
  mime_type: string;
  estado_upload?: string;
  hash_archivo?: string;
  fecha_captura?: string;
}

// ============================================
// FICHA COMPLETA (con todas las secciones)
// ============================================

export interface FichaCompleta {
  ficha: Ficha;
  revision_documentacion?: RevisionDocumentacion;
  acciones_correctivas: AccionCorrectiva[];
  no_conformidades: NoConformidad[];
  evaluacion_mitigacion?: EvaluacionMitigacion;
  evaluacion_poscosecha?: EvaluacionPoscosecha;
  evaluacion_conocimiento?: EvaluacionConocimientoNormas;
  actividades_pecuarias: ActividadPecuaria[];
  parcelas_inspeccionadas: ParcelaInspeccionada[];
  detalles_cultivo: DetalleCultivoParcela[];
  cosecha_ventas: CosechaVentas[];
  archivos: ArchivoFicha[];
}

export interface CreateFichaCompletaInput {
  ficha: CreateFichaInput;
  revision_documentacion?: CreateRevisionDocumentacionInput;
  acciones_correctivas?: CreateAccionCorrectivaInput[];
  no_conformidades?: CreateNoConformidadInput[];
  evaluacion_mitigacion?: CreateEvaluacionMitigacionInput;
  evaluacion_poscosecha?: CreateEvaluacionPoscosechaInput;
  evaluacion_conocimiento?: CreateEvaluacionConocimientoInput;
  actividades_pecuarias?: CreateActividadPecuariaInput[];
  parcelas_inspeccionadas?: CreateParcelaInspeccionadaInput[];
  detalles_cultivo?: CreateDetalleCultivoParcelaInput[];
  cosecha_ventas?: CreateCosechaVentasInput[];
}

// Input para actualizar ficha completa (sin codigo_productor ni gestion)
export interface UpdateFichaCompletaInput {
  ficha: {
    fecha_inspeccion: string;
    inspector_interno: string;
    persona_entrevistada?: string;
    categoria_gestion_anterior?: CategoriaGestion;
    comentarios_actividad_pecuaria?: string;
  };
  revision_documentacion?: CreateRevisionDocumentacionInput;
  acciones_correctivas?: CreateAccionCorrectivaInput[];
  no_conformidades?: CreateNoConformidadInput[];
  evaluacion_mitigacion?: CreateEvaluacionMitigacionInput;
  evaluacion_poscosecha?: CreateEvaluacionPoscosechaInput;
  evaluacion_conocimiento?: CreateEvaluacionConocimientoInput;
  actividades_pecuarias?: CreateActividadPecuariaInput[];
  parcelas_inspeccionadas?: CreateParcelaInspeccionadaInput[];
  detalles_cultivo?: CreateDetalleCultivoParcelaInput[];
  cosecha_ventas?: CreateCosechaVentasInput[];
}

// ============================================
// FILTROS Y LISTADO
// ============================================

export interface FichasFilters {
  codigo_productor?: string;
  gestion?: number;
  estado_ficha?: EstadoFicha;
  resultado_certificacion?: ResultadoCertificacion;
  inspector_interno?: string;
  comunidad?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  estado_sync?: EstadoSync;
  page?: number;
  limit?: number;
}

export interface FichasListResponse {
  fichas: Ficha[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// WORKFLOW ACTIONS
// ============================================

export interface EnviarRevisionInput {
  // Solo cambia el estado, no requiere campos adicionales
}

export interface AprobarFichaInput {
  comentarios?: string;
}

export interface RechazarFichaInput {
  motivo: string;
}

// ============================================
// ESTADISTICAS
// ============================================

export interface FichaEstadisticas {
  total: number;
  por_estado: {
    borrador: number;
    revision: number;
    aprobado: number;
    rechazado: number;
  };
  por_gestion: Record<number, number>;
  por_resultado: {
    aprobado: number;
    rechazado: number;
    pendiente: number;
  };
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface TipoCultivo {
  id_tipo_cultivo: string;
  nombre_cultivo: string;
  nombre_cientifico?: string;
  activo: boolean;
}

export interface Parcela {
  id_parcela: string;
  codigo_productor: string;
  nombre_parcela: string;
  superficie_ha: number;
  ubicacion?: {
    latitude: number;
    longitude: number;
  };
  activo: boolean;
}

// ============================================
// DRAFT TYPES (BORRADORES)
// ============================================

export interface FichaDraftMetadata {
  codigo_productor: string;
  gestion: number;
  step_actual: number;
  created_at: string;
  updated_at: string;
  saves_count: number;
  last_sync_server?: string;
  is_synced: boolean;
}

export interface FichaDraftData {
  id_draft?: string;
  codigo_productor: string;
  gestion: number;
  step_actual: number;
  draft_data: any; // Datos del formulario completo
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaveDraftInput {
  codigo_productor: string;
  gestion: number;
  step_actual: number;
  draft_data: any;
}
