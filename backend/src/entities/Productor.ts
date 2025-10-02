import {
  validateBolivianCoordinates,
  validateGPSPrecision,
  createPointWKT,
  type Coordinates,
} from "../utils/postgis.utils.js";

// Categorias de certificacion organica
export type CategoriaProductor = "E" | "2T" | "1T" | "0T";

// Interfaz para datos de Productor desde BD
export interface ProductorData {
  codigo_productor: string;
  nombre_productor: string;
  ci_documento?: string;
  id_comunidad: string;
  año_ingreso_programa: number;
  // Coordenadas decimales
  latitud_domicilio?: number;
  longitud_domicilio?: number;
  altitud_domicilio?: number;
  categoria_actual: CategoriaProductor;
  superficie_total_has: number;
  numero_parcelas_total: number;
  inicio_conversion_organica?: Date;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Datos enriquecidos por JOINs
  nombre_comunidad?: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  abreviatura_comunidad?: string;
}

// Interfaz para datos publicos de Productor (response)
export interface ProductorPublicData {
  codigo_productor: string;
  nombre_productor: string;
  ci_documento?: string;
  nombre_comunidad?: string;
  nombre_municipio?: string;
  nombre_provincia?: string;
  categoria_actual: CategoriaProductor;
  superficie_total_has: number;
  numero_parcelas_total: number;
  año_ingreso_programa: number;
  inicio_conversion_organica?: string;
  coordenadas?: Coordinates;
  activo: boolean;
  created_at: string;
}

// Entidad Productor
// Representa un productor de mani organico en el sistema
// Entidad central que conecta con la jerarquia geografica y las fichas
export class Productor {
  private data: ProductorData;

  constructor(data: ProductorData) {
    this.data = data;
  }

  // Getters principales
  get codigo(): string {
    return this.data.codigo_productor;
  }

  get nombre(): string {
    return this.data.nombre_productor;
  }

  get ciDocumento(): string | undefined {
    return this.data.ci_documento;
  }

  get idComunidad(): string {
    return this.data.id_comunidad;
  }

  get añoIngreso(): number {
    return this.data.año_ingreso_programa;
  }

  get categoriaActual(): CategoriaProductor {
    return this.data.categoria_actual;
  }

  get superficieTotal(): number {
    return this.data.superficie_total_has;
  }

  get numeroParcelas(): number {
    return this.data.numero_parcelas_total;
  }

  get inicioConversion(): Date | undefined {
    return this.data.inicio_conversion_organica;
  }

  get activo(): boolean {
    return this.data.activo;
  }

  get createdAt(): Date {
    return this.data.created_at;
  }

  get updatedAt(): Date {
    return this.data.updated_at;
  }

  // Getters geograficos
  get nombreComunidad(): string | undefined {
    return this.data.nombre_comunidad;
  }

  get nombreMunicipio(): string | undefined {
    return this.data.nombre_municipio;
  }

  get nombreProvincia(): string | undefined {
    return this.data.nombre_provincia;
  }

  get abreviaturaComunidad(): string | undefined {
    return this.data.abreviatura_comunidad;
  }

  // Getters coordenadas decimales
  get latitudDomicilio(): number | undefined {
    return this.data.latitud_domicilio;
  }

  get longitudDomicilio(): number | undefined {
    return this.data.longitud_domicilio;
  }

  get altitudDomicilio(): number | undefined {
    return this.data.altitud_domicilio;
  }

  // Getter coordenadas como objeto
  // Usa campos decimales directamente
  get coordenadasDomicilio(): Coordinates | null {
    if (
      this.data.latitud_domicilio == null ||
      this.data.longitud_domicilio == null
    ) {
      return null;
    }

    return {
      latitude: this.data.latitud_domicilio,
      longitude: this.data.longitud_domicilio,
      altitude: this.data.altitud_domicilio,
    };
  }

  // Crea una nueva instancia de Productor
  static create(data: {
    codigo_productor?: string;
    nombre_productor: string;
    ci_documento?: string;
    id_comunidad: string;
    año_ingreso_programa: number;
    categoria_actual?: CategoriaProductor;
    superficie_total_has?: number;
    numero_parcelas_total?: number;
    latitud_domicilio?: number;
    longitud_domicilio?: number;
    altitud_domicilio?: number;
  }): Productor {
    return new Productor({
      codigo_productor: data.codigo_productor || "",
      nombre_productor: data.nombre_productor,
      ci_documento: data.ci_documento,
      id_comunidad: data.id_comunidad,
      año_ingreso_programa: data.año_ingreso_programa,
      categoria_actual: data.categoria_actual || "E",
      superficie_total_has: data.superficie_total_has || 0,
      numero_parcelas_total: data.numero_parcelas_total || 0,
      latitud_domicilio: data.latitud_domicilio,
      longitud_domicilio: data.longitud_domicilio,
      altitud_domicilio: data.altitud_domicilio,
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Asigna el codigo generado al productor
  asignarCodigo(codigo: string): void {
    if (!codigo || codigo.trim().length < 5) {
      throw new Error("Codigo debe tener al menos 5 caracteres");
    }
    this.data.codigo_productor = codigo.trim().toUpperCase();
  }

  // Crea instancia desde datos de BD
  static fromDatabase(data: ProductorData): Productor {
    return new Productor(data);
  }

  // Valida los datos del productor
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar codigo productor
    if (
      !this.data.codigo_productor ||
      this.data.codigo_productor.trim().length < 5
    ) {
      errors.push("Codigo de productor debe tener al menos 5 caracteres");
    }

    if (this.data.codigo_productor && this.data.codigo_productor.length > 20) {
      errors.push("Codigo de productor no puede exceder 20 caracteres");
    }

    // Validar nombre
    if (
      !this.data.nombre_productor ||
      this.data.nombre_productor.trim().length < 3
    ) {
      errors.push("Nombre de productor debe tener al menos 3 caracteres");
    }

    if (this.data.nombre_productor && this.data.nombre_productor.length > 200) {
      errors.push("Nombre de productor no puede exceder 200 caracteres");
    }

    // Validar CI (opcional pero si existe debe ser valido)
    if (this.data.ci_documento) {
      const ciTrimmed = this.data.ci_documento.trim();
      if (ciTrimmed.length < 6 || ciTrimmed.length > 20) {
        errors.push("CI debe tener entre 6 y 20 caracteres");
      }

      if (!/^[0-9A-Za-z\-]+$/.test(ciTrimmed)) {
        errors.push("CI solo puede contener numeros, letras y guiones");
      }
    }

    // Validar comunidad
    if (!this.data.id_comunidad) {
      errors.push("ID de comunidad es requerido");
    }

    // Validar año ingreso
    const currentYear = new Date().getFullYear();
    if (
      this.data.año_ingreso_programa < 2000 ||
      this.data.año_ingreso_programa > currentYear + 1
    ) {
      errors.push(`Año de ingreso debe estar entre 2000 y ${currentYear + 1}`);
    }

    // Validar categoria
    const categoriasValidas: CategoriaProductor[] = ["E", "2T", "1T", "0T"];
    if (!categoriasValidas.includes(this.data.categoria_actual)) {
      errors.push("Categoria debe ser: E, 2T, 1T o 0T");
    }

    // Validar superficie
    if (this.data.superficie_total_has < 0) {
      errors.push("Superficie total no puede ser negativa");
    }

    if (this.data.superficie_total_has > 10000) {
      errors.push("Superficie total no puede exceder 10,000 hectareas");
    }

    // Validar parcelas
    if (this.data.numero_parcelas_total < 0) {
      errors.push("Numero de parcelas no puede ser negativo");
    }

    if (this.data.numero_parcelas_total > 100) {
      errors.push("Numero de parcelas no puede exceder 100");
    }

    // Validar coordenadas si existen
    if (
      this.data.latitud_domicilio !== undefined &&
      this.data.longitud_domicilio !== undefined
    ) {
      const coordValidation = validateBolivianCoordinates(
        this.data.latitud_domicilio,
        this.data.longitud_domicilio
      );

      if (!coordValidation.valid) {
        errors.push(`Coordenadas invalidas: ${coordValidation.error}`);
      }

      const precisionValidation = validateGPSPrecision(
        this.data.latitud_domicilio,
        this.data.longitud_domicilio
      );

      if (!precisionValidation.valid) {
        errors.push(`Precision GPS insuficiente: ${precisionValidation.error}`);
      }
    }

    // Validar que si tiene una coordenada, tenga la otra
    const hasLat = this.data.latitud_domicilio !== undefined;
    const hasLng = this.data.longitud_domicilio !== undefined;

    if (hasLat !== hasLng) {
      errors.push("Debe proporcionar tanto latitud como longitud, o ninguna");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Convierte a formato para insertar en BD
  toDatabaseInsert(): {
    codigo_productor: string;
    nombre_productor: string;
    ci_documento?: string;
    id_comunidad: string;
    año_ingreso_programa: number;
    latitud_domicilio?: number;
    longitud_domicilio?: number;
    altitud_domicilio?: number;
    categoria_actual: CategoriaProductor;
    superficie_total_has: number;
    numero_parcelas_total: number;
    inicio_conversion_organica?: Date;
    activo: boolean;
  } {
    return {
      codigo_productor: this.data.codigo_productor.trim().toUpperCase(),
      nombre_productor: this.data.nombre_productor.trim(),
      ci_documento: this.data.ci_documento?.trim(),
      id_comunidad: this.data.id_comunidad,
      año_ingreso_programa: this.data.año_ingreso_programa,
      latitud_domicilio: this.data.latitud_domicilio,
      longitud_domicilio: this.data.longitud_domicilio,
      altitud_domicilio: this.data.altitud_domicilio,
      categoria_actual: this.data.categoria_actual,
      superficie_total_has: this.data.superficie_total_has,
      numero_parcelas_total: this.data.numero_parcelas_total,
      inicio_conversion_organica: this.data.inicio_conversion_organica,
      activo: this.data.activo,
    };
  }

  // Convierte a formato para actualizar en BD
  toDatabaseUpdate(): {
    nombre_productor?: string;
    ci_documento?: string;
    latitud_domicilio?: number;
    longitud_domicilio?: number;
    altitud_domicilio?: number;
    categoria_actual?: CategoriaProductor;
    superficie_total_has?: number;
    numero_parcelas_total?: number;
    inicio_conversion_organica?: Date;
    activo?: boolean;
  } {
    return {
      nombre_productor: this.data.nombre_productor?.trim(),
      ci_documento: this.data.ci_documento?.trim(),
      latitud_domicilio: this.data.latitud_domicilio,
      longitud_domicilio: this.data.longitud_domicilio,
      altitud_domicilio: this.data.altitud_domicilio,
      categoria_actual: this.data.categoria_actual,
      superficie_total_has: this.data.superficie_total_has,
      numero_parcelas_total: this.data.numero_parcelas_total,
      inicio_conversion_organica: this.data.inicio_conversion_organica,
      activo: this.data.activo,
    };
  }

  // Convierte a formato JSON publico (sin datos sensibles)
  toJSON(): ProductorPublicData {
    return {
      codigo_productor: this.data.codigo_productor,
      nombre_productor: this.data.nombre_productor,
      ci_documento: this.data.ci_documento,
      nombre_comunidad: this.data.nombre_comunidad,
      nombre_municipio: this.data.nombre_municipio,
      nombre_provincia: this.data.nombre_provincia,
      categoria_actual: this.data.categoria_actual,
      superficie_total_has: this.data.superficie_total_has,
      numero_parcelas_total: this.data.numero_parcelas_total,
      año_ingreso_programa: this.data.año_ingreso_programa,
      inicio_conversion_organica:
        this.data.inicio_conversion_organica?.toISOString(),
      coordenadas: this.coordenadasDomicilio || undefined,
      activo: this.data.activo,
      created_at: this.data.created_at.toISOString(),
    };
  }

  /**
   * Genera string WKT para coordenadas PostGIS
   * Este WKT se puede usar como parametro en queries preparados
   *
   * @returns WKT string o null si no hay coordenadas
   *
   * @example
   * const wkt = productor.getCoordenadasWKT();
   * // Retorna: "POINT(-64.123456 -17.123456)" o null
   *
   * // Usar en query:
   * const query = {
   *   text: "INSERT INTO productores (coordenadas_domicilio) VALUES (ST_GeomFromText($1, 4326))",
   *   values: [wkt]
   * };
   */
  getCoordenadasWKT(): string | null {
    if (
      this.data.latitud_domicilio === undefined ||
      this.data.longitud_domicilio === undefined
    ) {
      return null;
    }

    try {
      return createPointWKT(
        this.data.latitud_domicilio,
        this.data.longitud_domicilio
      );
    } catch (error) {
      return null;
    }
  }

  // Verifica si el productor puede ser desactivado
  puedeDesactivar(): { valid: boolean; error?: string } {
    if (!this.data.activo) {
      return {
        valid: false,
        error: "El productor ya esta inactivo",
      };
    }

    return { valid: true };
  }

  // Verifica si tiene coordenadas de domicilio
  tieneCoordenadas(): boolean {
    return (
      this.data.latitud_domicilio !== undefined &&
      this.data.longitud_domicilio !== undefined
    );
  }

  // Verifica si la categoria es organica (E)
  esOrganico(): boolean {
    return this.data.categoria_actual === "E";
  }

  // Verifica si la categoria es en transicion
  esEnTransicion(): boolean {
    return ["2T", "1T", "0T"].includes(this.data.categoria_actual);
  }

  // Calcula años en el programa
  getAñosEnPrograma(): number {
    const currentYear = new Date().getFullYear();
    return currentYear - this.data.año_ingreso_programa;
  }

  // Actualiza coordenadas de domicilio
  actualizarCoordenadas(
    latitud: number,
    longitud: number,
    altitud?: number
  ): void {
    const validation = validateBolivianCoordinates(latitud, longitud);
    if (!validation.valid) {
      throw new Error(`Coordenadas invalidas: ${validation.error}`);
    }

    const precisionValidation = validateGPSPrecision(latitud, longitud);
    if (!precisionValidation.valid) {
      throw new Error(
        `Precision GPS insuficiente: ${precisionValidation.error}`
      );
    }

    this.data.latitud_domicilio = latitud;
    this.data.longitud_domicilio = longitud;
    this.data.altitud_domicilio = altitud;
    this.data.updated_at = new Date();
  }

  // Actualiza nombre del productor
  actualizarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      throw new Error("Nombre debe tener al menos 3 caracteres");
    }

    if (nuevoNombre.trim().length > 200) {
      throw new Error("Nombre no puede exceder 200 caracteres");
    }

    this.data.nombre_productor = nuevoNombre.trim();
    this.data.updated_at = new Date();
  }

  // Actualiza categoria de certificacion
  actualizarCategoria(nuevaCategoria: CategoriaProductor): void {
    const categoriasValidas: CategoriaProductor[] = ["E", "2T", "1T", "0T"];
    if (!categoriasValidas.includes(nuevaCategoria)) {
      throw new Error("Categoria debe ser: E, 2T, 1T o 0T");
    }

    this.data.categoria_actual = nuevaCategoria;
    this.data.updated_at = new Date();
  }

  // Actualiza superficie total
  actualizarSuperficie(nuevaSuperficie: number): void {
    if (nuevaSuperficie < 0) {
      throw new Error("Superficie no puede ser negativa");
    }

    if (nuevaSuperficie > 10000) {
      throw new Error("Superficie no puede exceder 10,000 hectareas");
    }

    this.data.superficie_total_has = nuevaSuperficie;
    this.data.updated_at = new Date();
  }

  // Actualiza numero de parcelas
  actualizarParcelas(numeroParcelas: number): void {
    if (numeroParcelas < 0) {
      throw new Error("Numero de parcelas no puede ser negativo");
    }

    if (numeroParcelas > 100) {
      throw new Error("Numero de parcelas no puede exceder 100");
    }

    this.data.numero_parcelas_total = numeroParcelas;
    this.data.updated_at = new Date();
  }

  // Activa el productor
  activar(): void {
    this.data.activo = true;
    this.data.updated_at = new Date();
  }

  // Desactiva el productor
  desactivar(): void {
    const validacion = this.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    this.data.activo = false;
    this.data.updated_at = new Date();
  }

  // Obtiene nombre completo con ubicacion
  getNombreCompleto(): string {
    const partes = [this.data.nombre_productor];

    if (this.data.nombre_comunidad) {
      partes.push(this.data.nombre_comunidad);
    }

    if (this.data.nombre_municipio) {
      partes.push(this.data.nombre_municipio);
    }

    return partes.join(", ");
  }

  // Obtiene informacion resumida del productor
  getResumen(): string {
    return `${this.data.codigo_productor} - ${this.data.nombre_productor} (${this.data.categoria_actual}) - ${this.data.superficie_total_has} ha`;
  }

  // Compara dos productores por codigo (para ordenamiento)
  static compararPorCodigo(a: Productor, b: Productor): number {
    return a.codigo.localeCompare(b.codigo);
  }

  // Compara dos productores por nombre (para ordenamiento)
  static compararPorNombre(a: Productor, b: Productor): number {
    return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
  }
}
