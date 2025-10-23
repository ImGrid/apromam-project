import { ReadQuery, WriteQuery } from "../config/connection.js";
import { Parcela, ParcelaData } from "../entities/Parcela.js";

export class ParcelaRepository {
  // Encuentra parcela por ID con datos enriquecidos
  async findById(id: string): Promise<Parcela | null> {
    const query = {
      name: "find-parcela-by-id",
      text: `
        SELECT
          pa.id_parcela,
          pa.codigo_productor,
          pa.numero_parcela,
          pa.superficie_ha,
          pa.latitud_sud,
          pa.longitud_oeste,
          pa.utiliza_riego,
          pa.tipo_barrera,
          pa.insumos_organicos,
          pa.rotacion,
          pa.activo,
          pa.created_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM parcelas pa
        INNER JOIN productores p ON pa.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE pa.id_parcela = $1 AND pa.activo = true
      `,
      values: [id],
    };

    const result = await ReadQuery.findOne<ParcelaData>(query);
    return result ? Parcela.fromDatabase(result) : null;
  }

  // Lista todas las parcelas de un productor
  async findByProductor(codigoProductor: string): Promise<Parcela[]> {
    const query = {
      name: "find-parcelas-by-productor",
      text: `
        SELECT
          pa.id_parcela,
          pa.codigo_productor,
          pa.numero_parcela,
          pa.superficie_ha,
          pa.latitud_sud,
          pa.longitud_oeste,
          pa.utiliza_riego,
          pa.tipo_barrera,
          pa.insumos_organicos,
          pa.rotacion,
          pa.activo,
          pa.created_at,
          p.nombre_productor
        FROM parcelas pa
        INNER JOIN productores p ON pa.codigo_productor = p.codigo_productor
        WHERE pa.codigo_productor = $1 AND pa.activo = true
        ORDER BY pa.numero_parcela ASC
      `,
      values: [codigoProductor],
    };

    const results = await ReadQuery.execute<ParcelaData>(query);
    return results.map((data) => Parcela.fromDatabase(data));
  }

  // Lista todas las parcelas activas
  async findAll(): Promise<Parcela[]> {
    const query = {
      name: "find-all-parcelas",
      text: `
        SELECT
          pa.id_parcela,
          pa.codigo_productor,
          pa.numero_parcela,
          pa.superficie_ha,
          pa.latitud_sud,
          pa.longitud_oeste,
          pa.utiliza_riego,
          pa.tipo_barrera,
          pa.insumos_organicos,
          pa.rotacion,
          pa.activo,
          pa.created_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM parcelas pa
        INNER JOIN productores p ON pa.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE pa.activo = true
        ORDER BY p.codigo_productor, pa.numero_parcela
      `,
      values: [],
    };

    const results = await ReadQuery.execute<ParcelaData>(query);
    return results.map((data) => Parcela.fromDatabase(data));
  }

  // Busca parcelas cercanas a una ubicacion
  // Usa PostGIS para calcular distancias
  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<Parcela[]> {
    const query = {
      name: "find-parcelas-nearby",
      text: `
        SELECT
          pa.id_parcela,
          pa.codigo_productor,
          pa.numero_parcela,
          pa.superficie_ha,
          pa.latitud_sud,
          pa.longitud_oeste,
          pa.utiliza_riego,
          pa.tipo_barrera,
          pa.insumos_organicos,
          pa.rotacion,
          pa.activo,
          pa.created_at,
          p.nombre_productor,
          c.nombre_comunidad,
          ROUND(
            ST_Distance(
              pa.coordenadas::geography,
              ST_SetSRID(ST_Point($2, $1), 4326)::geography
            )::NUMERIC, 2
          ) as distancia_metros
        FROM parcelas pa
        INNER JOIN productores p ON pa.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE pa.coordenadas IS NOT NULL
          AND pa.activo = true
          AND ST_DWithin(
            pa.coordenadas::geography,
            ST_SetSRID(ST_Point($2, $1), 4326)::geography,
            $3
          )
        ORDER BY pa.coordenadas <-> ST_SetSRID(ST_Point($2, $1), 4326)
      `,
      values: [latitude, longitude, radiusMeters],
    };

    const results = await ReadQuery.execute<ParcelaData>(query);
    return results.map((data) => Parcela.fromDatabase(data));
  }

  // Verifica si existe una parcela con ese numero para el productor
  async existsByNumero(
    codigoProductor: string,
    numeroParcela: number
  ): Promise<boolean> {
    const query = {
      text: `
        SELECT EXISTS(
          SELECT 1 
          FROM parcelas
          WHERE codigo_productor = $1 
            AND numero_parcela = $2
        ) as exists
      `,
      values: [codigoProductor, numeroParcela],
    };

    const result = await ReadQuery.findOne<{ exists: boolean }>(query);
    return result?.exists ?? false;
  }

  // Crea una nueva parcela
  async create(parcela: Parcela): Promise<Parcela> {
    const validation = parcela.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    // Verificar duplicados
    const existe = await this.existsByNumero(
      parcela.codigoProductor,
      parcela.numeroParcela
    );

    if (existe) {
      throw new Error(
        `Ya existe la parcela ${parcela.numeroParcela} para este productor`
      );
    }

    const insertData = parcela.toDatabaseInsert();
    const coordenadasWKT = parcela.getCoordenadasWKT();

    const query = {
      text: `
        INSERT INTO parcelas (
          codigo_productor,
          numero_parcela,
          superficie_ha,
          coordenadas,
          latitud_sud,
          longitud_oeste,
          utiliza_riego,
          tipo_barrera,
          insumos_organicos,
          rotacion,
          activo
        ) VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9, $10, $11)
        RETURNING id_parcela
      `,
      values: [
        insertData.codigo_productor,
        insertData.numero_parcela,
        insertData.superficie_ha,
        coordenadasWKT,
        insertData.latitud_sud || null,
        insertData.longitud_oeste || null,
        insertData.utiliza_riego,
        insertData.tipo_barrera,
        insertData.insumos_organicos || null,
        insertData.rotacion,
        insertData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Error al crear parcela");
    }

    // Obtener la parcela creada con sus datos completos
    const parcelaCreada = await this.findByProductorAndNumero(
      parcela.codigoProductor,
      parcela.numeroParcela
    );

    if (!parcelaCreada) {
      throw new Error("Parcela creada pero no se pudo recuperar");
    }

    return parcelaCreada;
  }

  // Helper para encontrar por productor y numero
  private async findByProductorAndNumero(
    codigoProductor: string,
    numeroParcela: number
  ): Promise<Parcela | null> {
    const query = {
      text: `
        SELECT
          pa.id_parcela,
          pa.codigo_productor,
          pa.numero_parcela,
          pa.superficie_ha,
          pa.latitud_sud,
          pa.longitud_oeste,
          pa.utiliza_riego,
          pa.tipo_barrera,
          pa.insumos_organicos,
          pa.rotacion,
          pa.activo,
          pa.created_at,
          p.nombre_productor
        FROM parcelas pa
        INNER JOIN productores p ON pa.codigo_productor = p.codigo_productor
        WHERE pa.codigo_productor = $1
          AND pa.numero_parcela = $2
          AND pa.activo = true
      `,
      values: [codigoProductor, numeroParcela],
    };

    const result = await ReadQuery.findOne<ParcelaData>(query);
    return result ? Parcela.fromDatabase(result) : null;
  }

  // Actualiza una parcela existente
  async update(id: string, parcela: Parcela): Promise<Parcela> {
    const validation = parcela.validate();
    if (!validation.valid) {
      throw new Error(`Validacion fallo: ${validation.errors.join(", ")}`);
    }

    const updateData = parcela.toDatabaseUpdate();
    const coordenadasWKT = parcela.getCoordenadasWKT();

    const query = {
      text: `
        UPDATE parcelas
        SET
          coordenadas = ST_GeomFromText($2, 4326),
          latitud_sud = $3,
          longitud_oeste = $4,
          utiliza_riego = $5,
          tipo_barrera = $6,
          insumos_organicos = $7,
          rotacion = $8,
          activo = $9
        WHERE id_parcela = $1 AND activo = true
        RETURNING id_parcela
      `,
      values: [
        id,
        coordenadasWKT,
        updateData.latitud_sud || null,
        updateData.longitud_oeste || null,
        updateData.utiliza_riego,
        updateData.tipo_barrera,
        updateData.insumos_organicos || null,
        updateData.rotacion,
        updateData.activo,
      ],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success || result.affectedRows === 0) {
      throw new Error(result.error || "Parcela no encontrada o ya inactiva");
    }

    const parcelaActualizada = await this.findById(id);
    if (!parcelaActualizada) {
      throw new Error("Parcela actualizada pero no se pudo recuperar");
    }

    return parcelaActualizada;
  }

  // Desactiva una parcela (soft delete)
  async softDelete(id: string): Promise<void> {
    const parcela = await this.findById(id);
    if (!parcela) {
      throw new Error("Parcela no encontrada");
    }

    const validacion = parcela.puedeDesactivar();
    if (!validacion.valid) {
      throw new Error(validacion.error);
    }

    const query = {
      text: `
        UPDATE parcelas
        SET activo = false
        WHERE id_parcela = $1 AND activo = true
      `,
      values: [id],
    };

    const result = await WriteQuery.execute(query);
    if (!result.success) {
      throw new Error(result.error || "Error al desactivar parcela");
    }

    if (result.affectedRows === 0) {
      throw new Error("Parcela no encontrada o ya inactiva");
    }
  }

  // Cuenta parcelas por productor
  async countByProductor(codigoProductor: string): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM parcelas
        WHERE codigo_productor = $1 AND activo = true
      `,
      values: [codigoProductor],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Cuenta parcelas con coordenadas GPS
  async countWithCoordinates(): Promise<number> {
    const query = {
      text: `
        SELECT COUNT(*) as count
        FROM parcelas
        WHERE coordenadas IS NOT NULL AND activo = true
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{ count: string }>(query);
    return parseInt(result?.count || "0", 10);
  }

  // Obtiene parcelas sin coordenadas
  async findWithoutCoordinates(): Promise<Parcela[]> {
    const query = {
      text: `
        SELECT
          pa.id_parcela,
          pa.codigo_productor,
          pa.numero_parcela,
          pa.superficie_ha,
          pa.latitud_sud,
          pa.longitud_oeste,
          pa.utiliza_riego,
          pa.tipo_barrera,
          pa.insumos_organicos,
          pa.rotacion,
          pa.activo,
          pa.created_at,
          p.nombre_productor,
          c.nombre_comunidad
        FROM parcelas pa
        INNER JOIN productores p ON pa.codigo_productor = p.codigo_productor
        INNER JOIN comunidades c ON p.id_comunidad = c.id_comunidad
        WHERE pa.coordenadas IS NULL AND pa.activo = true
        ORDER BY p.codigo_productor, pa.numero_parcela
      `,
      values: [],
    };

    const results = await ReadQuery.execute<ParcelaData>(query);
    return results.map((data) => Parcela.fromDatabase(data));
  }

  // Obtiene estadisticas de parcelas
  async getEstadisticas(): Promise<{
    total: number;
    con_coordenadas: number;
    sin_coordenadas: number;
    con_riego: number;
  }> {
    const query = {
      text: `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE coordenadas IS NOT NULL) as con_coordenadas,
          COUNT(*) FILTER (WHERE coordenadas IS NULL) as sin_coordenadas,
          COUNT(*) FILTER (WHERE utiliza_riego = true) as con_riego
        FROM parcelas
        WHERE activo = true
      `,
      values: [],
    };

    const result = await ReadQuery.findOne<{
      total: string;
      con_coordenadas: string;
      sin_coordenadas: string;
      con_riego: string;
    }>(query);

    return {
      total: parseInt(result?.total || "0", 10),
      con_coordenadas: parseInt(result?.con_coordenadas || "0", 10),
      sin_coordenadas: parseInt(result?.sin_coordenadas || "0", 10),
      con_riego: parseInt(result?.con_riego || "0", 10),
    };
  }
}
