import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Productor, ProductorData } from "../entities/Productor.js";

export class ProductorRepository {
  // Encuentra productor por codigo con datos enriquecidos
  // JOIN con comunidad, municipio y provincia
  // Incluye coordenadas PostGIS y decimales
  async findByCodigo(codigo: string): Promise<Productor | null> {
    const query = {
      name: "find-productor-by-codigo",
      text: `
        SELECT
          p.codigo_productor,
          p.nombre_productor,
          p.ci_documento,
          p.id_comunidad,
          p.id_organizacion,
          p.año_ingreso_programa,
          p.latitud_domicilio,
          p.longitud_domicilio,
          p.altitud_domicilio,
          p.categoria_actual,
          p.superficie_total_has,
          p.numero_parcelas_total,
          p.inicio_conversion_organica,
          p.activo,
          p.created_at,
          p.updated_at,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          m.nombre_municipio,
          pr.nombre_provincia,
          o.nombre_organizacion,
          o.abreviatura_organizacion
        FROM productores p
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        INNER JOIN municipios m ON c.id_municipio = m.id_municipio
        INNER JOIN provincias pr ON m.id_provincia = pr.id_provincia
        LEFT JOIN organizaciones o ON p.id_organizacion = o.id_organizacion
        WHERE p.codigo_productor = $1 AND p.activo = true
      `,
      values: [codigo],
    };

    const result = await ReadQuery.findOne<ProductorData>(query);
    return result ? Productor.fromDatabase(result) : null;
  }
  // Genera el siguiente codigo de productor para una comunidad
  // Formato: VS + ABREVIATURA + NUMERO (ej: VSSLP01, VSSLP02)
  async getNextCodigoByComunidad(
    comunidadId: string,
    abreviaturaComunidad: string
  ): Promise<string> {
    // Normalizar abreviatura
    const abreviatura = abreviaturaComunidad.trim().toUpperCase();
    const prefijo = `VS${abreviatura}`;

    // Obtener el ultimo codigo de esta comunidad
    const query = {
      text: `
        SELECT codigo_productor 
        FROM productores 
        WHERE id_comunidad = $1 
          AND codigo_productor LIKE $2
        ORDER BY codigo_productor DESC 
        LIMIT 1
      `,
      values: [comunidadId, `${prefijo}%`],
    };

    const result = await ReadQuery.findOne<{ codigo_productor: string }>(query);

    let numeroSiguiente = 1;

    if (result && result.codigo_productor) {
      // Extraer el numero del ultimo codigo
      // Ejemplo: VSSLP05 -> extraer "05"
      const ultimoCodigo = result.codigo_productor;
      const numeroStr = ultimoCodigo.substring(prefijo.length);
      const numeroActual = parseInt(numeroStr, 10);

      if (!isNaN(numeroActual)) {
        numeroSiguiente = numeroActual + 1;
      }
    }

    // Validar que no exceda 99
    if (numeroSiguiente > 99) {
      throw new Error(
        `La comunidad ${abreviatura} ha alcanzado el limite de 99 productores`
      );
    }

    // Formatear con padding de 2 digitos
    const numeroFormateado = numeroSiguiente.toString().padStart(2, "0");
    const codigoGenerado = `${prefijo}${numeroFormateado}`;

    return codigoGenerado;
  }
  // Lista productores por comunidad
  // Usado por tecnicos para ver sus productores
  async findByComunidad(comunidadId: string): Promise<Productor[]> {
    const query = {
      name: "find-productores-by-comunidad",
      text: `
        SELECT
          p.codigo_productor,
          p.nombre_productor,
          p.ci_documento,
          p.id_comunidad,
          p.id_organizacion,
          p.año_ingreso_programa,
          p.latitud_domicilio,
          p.longitud_domicilio,
          p.altitud_domicilio,
          p.categoria_actual,
          p.superficie_total_has,
          p.numero_parcelas_total,
          p.inicio_conversion_organica,
          p.activo,
          p.created_at,
          p.updated_at,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          o.nombre_organizacion,
          o.abreviatura_organizacion
        FROM productores p
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        LEFT JOIN organizaciones o ON p.id_organizacion = o.id_organizacion
        WHERE p.id_comunidad = $1 AND p.activo = true
        ORDER BY p.codigo_productor
      `,
      values: [comunidadId],
    };

    const results = await ReadQuery.execute<ProductorData>(query);
    return results.map((data) => Productor.fromDatabase(data));
  }

  // Lista todos los productores activos
  // Con filtros opcionales por categoria
  async findAll(categoria?: string): Promise<Productor[]> {
    let queryText = `
      SELECT
        p.codigo_productor,
        p.nombre_productor,
        p.ci_documento,
        p.id_comunidad,
        p.id_organizacion,
        p.año_ingreso_programa,
        p.latitud_domicilio,
        p.longitud_domicilio,
        p.altitud_domicilio,
        p.categoria_actual,
        p.superficie_total_has,
        p.numero_parcelas_total,
        p.inicio_conversion_organica,
        p.activo,
        p.created_at,
        p.updated_at,
        c.nombre_comunidad,
        c.abreviatura_comunidad,
        m.nombre_municipio,
        pr.nombre_provincia,
        o.nombre_organizacion,
        o.abreviatura_organizacion
      FROM productores p
      INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
      INNER JOIN municipios m ON c.id_municipio = m.id_municipio
      INNER JOIN provincias pr ON m.id_provincia = pr.id_provincia
      LEFT JOIN organizaciones o ON p.id_organizacion = o.id_organizacion
      WHERE p.activo = true
    `;

    const values: any[] = [];

    if (categoria) {
      queryText += ` AND p.categoria_actual = $1`;
      values.push(categoria);
    }

    queryText += ` ORDER BY p.codigo_productor`;

    const query = {
      text: queryText,
      values,
    };

    const results = await ReadQuery.execute<ProductorData>(query);
    return results.map((data) => Productor.fromDatabase(data));
  }

  // Busca productores cercanos a una ubicacion
  // Usa funciones PostGIS para calcular distancia
  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<Productor[]> {
    const query = {
      name: "find-productores-nearby",
      text: `
        SELECT 
          p.codigo_productor,
          p.nombre_productor,
          p.ci_documento,
          p.id_comunidad,
          p.año_ingreso_programa,
          p.latitud_domicilio,
          p.longitud_domicilio,
          p.altitud_domicilio,
          p.categoria_actual,
          p.superficie_total_has,
          p.numero_parcelas_total,
          p.inicio_conversion_organica,
          p.activo,
          p.created_at,
          p.updated_at,
          c.nombre_comunidad,
          c.abreviatura_comunidad,
          ROUND(
            ST_Distance(
              p.coordenadas_domicilio::geography,
              ST_SetSRID(ST_Point($2, $1), 4326)::geography
            )::NUMERIC, 2
          ) as distancia_metros
        FROM productores p
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE p.coordenadas_domicilio IS NOT NULL
          AND p.activo = true
          AND ST_DWithin(
            p.coordenadas_domicilio::geography,
            ST_SetSRID(ST_Point($2, $1), 4326)::geography,
            $3
          )
        ORDER BY p.coordenadas_domicilio <-> ST_SetSRID(ST_Point($2, $1), 4326)
      `,
      values: [latitude, longitude, radiusMeters],
    };

    const results = await ReadQuery.execute<ProductorData>(query);
    return results.map((data) => Productor.fromDatabase(data));
  }

  // Verifica si existe productor con el codigo
  // Para evitar duplicados
  async existsByCodigo(codigo: string): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM productores
          WHERE codigo_productor = $1
        ) as exists
      `,
      values: [codigo],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea un nuevo productor
  // Maneja coordenadas PostGIS si existen
  async create(productor: Productor): Promise<Productor> {
    const validation = productor.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByCodigo(productor.codigo);
    if (existe) {
      throw new Error(
        `Ya existe un productor con codigo "${productor.codigo}"`
      );
    }

    const insertData = productor.toDatabaseInsert();

    // Generar SQL para coordenadas PostGIS si existen
    const coordenadasWKT = productor.getCoordenadasWKT();

    const query = {
      text: `
      INSERT INTO productores (
        codigo_productor,
        nombre_productor,
        ci_documento,
        id_comunidad,
        año_ingreso_programa,
        latitud_domicilio,
        longitud_domicilio,
        altitud_domicilio,
        coordenadas_domicilio,
        categoria_actual,
        superficie_total_has,
        numero_parcelas_total,
        inicio_conversion_organica,
        activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromText($9, 4326), $10, $11, $12, $13, $14)
      `,
      values: [
        insertData.codigo_productor,
        insertData.nombre_productor,
        insertData.ci_documento || null,
        insertData.id_comunidad,
        insertData.año_ingreso_programa,
        insertData.latitud_domicilio || null,
        insertData.longitud_domicilio || null,
        insertData.altitud_domicilio || null,
        coordenadasWKT,
        insertData.categoria_actual,
        insertData.superficie_total_has,
        insertData.numero_parcelas_total,
        insertData.inicio_conversion_organica || null,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Error al crear productor");
    }

    const productorCreado = await this.findByCodigo(productor.codigo);
    if (!productorCreado) {
      throw new Error("Productor creado pero no se pudo recuperar");
    }

    return productorCreado;
  }

  // Actualiza un productor existente
  // El trigger de BD sincroniza coordenadas automaticamente
  async update(codigo: string, productor: Productor): Promise<Productor> {
    const validation = productor.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = productor.toDatabaseUpdate();
    const coordenadasWKT = productor.getCoordenadasWKT();

    const query = {
      text: `
      UPDATE productores
      SET 
        nombre_productor = $2,
        ci_documento = $3,
        latitud_domicilio = $4,
        longitud_domicilio = $5,
        altitud_domicilio = $6,
        coordenadas_domicilio = ST_GeomFromText($7, 4326),
        categoria_actual = $8,
        superficie_total_has = $9,
        numero_parcelas_total = $10,
        inicio_conversion_organica = $11,
        activo = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE codigo_productor = $1 AND activo = true
      `,
      values: [
        codigo,
        updateData.nombre_productor,
        updateData.ci_documento || null,
        updateData.latitud_domicilio || null,
        updateData.longitud_domicilio || null,
        updateData.altitud_domicilio || null,
        coordenadasWKT,
        updateData.categoria_actual,
        updateData.superficie_total_has,
        updateData.numero_parcelas_total,
        updateData.inicio_conversion_organica || null,
        updateData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Productor no encontrado o ya inactivo");
    }

    const productorActualizado = await this.findByCodigo(codigo);
    if (!productorActualizado) {
      throw new Error("Productor actualizado pero no se pudo recuperar");
    }

    return productorActualizado;
  }

  // Desactiva un productor (soft delete)
  // Solo admin puede desactivar
  async softDelete(codigo: string): Promise<void> {
    const productor = await this.findByCodigo(codigo);
    if (!productor) {
      throw new Error("Productor no encontrado");
    }

    const validacion = productor.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE productores
        SET 
          activo = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE codigo_productor = $1 AND activo = true
      `,
      values: [codigo],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar productor");
    }

    if (result.affectedRows === 0) {
      throw new Error("Productor no encontrado o ya inactivo");
    }
  }

  // Cuenta productores por comunidad
  async countByComunidad(comunidadId: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM productores
        WHERE id_comunidad = $1 AND activo = true
      `,
      values: [comunidadId],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Cuenta productores por categoria
  async countByCategoria(categoria: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM productores
        WHERE categoria_actual = $1 AND activo = true
      `,
      values: [categoria],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Cuenta productores con coordenadas GPS
  async countWithCoordinates(): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM productores
        WHERE coordenadas_domicilio IS NOT NULL AND activo = true
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }
}
