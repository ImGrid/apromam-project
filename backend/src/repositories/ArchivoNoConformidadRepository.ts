import { randomUUID } from "crypto";
import { ReadQuery, WriteQuery } from "../config/connection.js";
import {
  ArchivoNoConformidad,
  ArchivoNoConformidadData,
} from "../entities/ArchivoNoConformidad.js";

// Repositorio para gestionar la persistencia de archivos de no conformidades en la BD
export class ArchivoNoConformidadRepository {
  // Guarda una nueva entidad ArchivoNoConformidad en la base de datos
  async create(archivo: ArchivoNoConformidad): Promise<ArchivoNoConformidad> {
    const insertData = archivo.toDatabaseInsert();
    const idArchivo = randomUUID();

    const query = {
      name: "create-archivo-nc",
      text: `
        INSERT INTO archivos_no_conformidad (
          id_archivo, id_no_conformidad, tipo_archivo, nombre_original, ruta_almacenamiento,
          tamaño_bytes, mime_type, estado_upload, hash_archivo, fecha_captura, subido_por
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      values: [
        idArchivo,
        insertData.id_no_conformidad,
        insertData.tipo_archivo,
        insertData.nombre_original,
        insertData.ruta_almacenamiento,
        insertData.tamaño_bytes,
        insertData.mime_type,
        insertData.estado_upload,
        insertData.hash_archivo,
        insertData.fecha_captura,
        insertData.subido_por,
      ],
    };

    const result = await WriteQuery.insert<ArchivoNoConformidadData>(query);

    if (!result.success || !result.data) {
      throw new Error(
        result.error || "Error al crear el registro del archivo de NC."
      );
    }

    return ArchivoNoConformidad.fromDatabase(result.data);
  }

  // Busca archivos por el ID de la no conformidad
  async findByNoConformidadId(
    id_no_conformidad: string
  ): Promise<ArchivoNoConformidad[]> {
    const query = {
      name: "find-archivos-by-nc-id",
      text: `
        SELECT * FROM archivos_no_conformidad
        WHERE id_no_conformidad = $1
        ORDER BY created_at DESC
      `,
      values: [id_no_conformidad],
    };

    const results = await ReadQuery.execute<ArchivoNoConformidadData>(query);
    return results.map((row) => ArchivoNoConformidad.fromDatabase(row));
  }

  // Busca archivos por el ID de la no conformidad y tipo
  async findByNoConformidadIdAndTipo(
    id_no_conformidad: string,
    tipo_archivo: string
  ): Promise<ArchivoNoConformidad[]> {
    const query = {
      name: "find-archivos-by-nc-id-and-tipo",
      text: `
        SELECT * FROM archivos_no_conformidad
        WHERE id_no_conformidad = $1 AND tipo_archivo = $2
        ORDER BY created_at DESC
      `,
      values: [id_no_conformidad, tipo_archivo],
    };

    const results = await ReadQuery.execute<ArchivoNoConformidadData>(query);
    return results.map((row) => ArchivoNoConformidad.fromDatabase(row));
  }

  // Busca un archivo por su ID
  async findById(id_archivo: string): Promise<ArchivoNoConformidad | null> {
    const query = {
      name: "find-archivo-nc-by-id",
      text: `
        SELECT * FROM archivos_no_conformidad
        WHERE id_archivo = $1
      `,
      values: [id_archivo],
    };

    const results = await ReadQuery.execute<ArchivoNoConformidadData>(query);

    if (results.length === 0) {
      return null;
    }

    return ArchivoNoConformidad.fromDatabase(results[0]);
  }

  // Actualiza el estado de upload de un archivo
  async updateEstadoUpload(
    id_archivo: string,
    estado: string
  ): Promise<ArchivoNoConformidad | null> {
    const query = {
      name: "update-estado-upload-nc",
      text: `
        UPDATE archivos_no_conformidad
        SET estado_upload = $1
        WHERE id_archivo = $2
        RETURNING *
      `,
      values: [estado, id_archivo],
    };

    const results = await ReadQuery.execute<ArchivoNoConformidadData>(query);

    if (results.length === 0) {
      return null;
    }

    return ArchivoNoConformidad.fromDatabase(results[0]);
  }

  // Actualiza el hash de un archivo
  async updateHash(
    id_archivo: string,
    hash: string
  ): Promise<ArchivoNoConformidad | null> {
    const query = {
      name: "update-hash-archivo-nc",
      text: `
        UPDATE archivos_no_conformidad
        SET hash_archivo = $1
        WHERE id_archivo = $2
        RETURNING *
      `,
      values: [hash, id_archivo],
    };

    const results = await ReadQuery.execute<ArchivoNoConformidadData>(query);

    if (results.length === 0) {
      return null;
    }

    return ArchivoNoConformidad.fromDatabase(results[0]);
  }

  // Elimina un archivo de la base de datos
  async delete(id_archivo: string): Promise<void> {
    const query = {
      name: "delete-archivo-nc",
      text: `
        DELETE FROM archivos_no_conformidad
        WHERE id_archivo = $1
      `,
      values: [id_archivo],
    };

    const result = await WriteQuery.execute(query);

    if (!result.success) {
      throw new Error(
        result.error ||
          "Error al eliminar el archivo de NC de la base de datos"
      );
    }
  }

  // Cuenta archivos por no conformidad
  async countByNoConformidad(
    id_no_conformidad: string,
    tipo_archivo?: string
  ): Promise<number> {
    let queryText = `
      SELECT COUNT(*) as count
      FROM archivos_no_conformidad
      WHERE id_no_conformidad = $1
    `;

    const values: unknown[] = [id_no_conformidad];

    if (tipo_archivo) {
      queryText += ` AND tipo_archivo = $2`;
      values.push(tipo_archivo);
    }

    const query = {
      name: tipo_archivo
        ? "count-archivos-nc-by-tipo"
        : "count-archivos-nc",
      text: queryText,
      values,
    };

    const results = await ReadQuery.execute<{ count: string }>(query);
    return parseInt(results[0]?.count ?? "0", 10);
  }

  // Verifica si existe un archivo
  async exists(id_archivo: string): Promise<boolean> {
    const query = {
      name: "archivo-nc-exists",
      text: `
        SELECT EXISTS(
          SELECT 1 FROM archivos_no_conformidad
          WHERE id_archivo = $1
        ) as exists
      `,
      values: [id_archivo],
    };

    const results = await ReadQuery.execute<{ exists: boolean }>(query);
    return results[0]?.exists ?? false;
  }
}
