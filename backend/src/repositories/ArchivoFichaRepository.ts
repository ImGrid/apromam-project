import { ReadQuery, WriteQuery } from "../config/connection.js";
import { ArchivoFicha, ArchivoFichaData } from "../entities/ArchivoFicha.js";

// Repositorio para gestionar la persistencia de archivos de fichas en la BD
export class ArchivoFichaRepository {

  // Guarda una nueva entidad ArchivoFicha en la base de datos
  async create(archivo: ArchivoFicha): Promise<ArchivoFicha> {
    const insertData = archivo.toDatabaseInsert();

    const query = {
      name: "create-archivo-ficha",
      text: `
        INSERT INTO archivos_ficha (
          id_ficha, tipo_archivo, nombre_original, ruta_almacenamiento,
          tamaño_bytes, mime_type, estado_upload, hash_archivo, fecha_captura
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      values: [
        insertData.id_ficha,
        insertData.tipo_archivo,
        insertData.nombre_original,
        insertData.ruta_almacenamiento,
        insertData.tamaño_bytes,
        insertData.mime_type,
        insertData.estado_upload,
        insertData.hash_archivo,
        insertData.fecha_captura,
      ],
    };

    const result = await WriteQuery.insert<ArchivoFichaData>(query);

    if (!result.success || !result.data) {
      throw new Error(result.error || "Error al crear el registro del archivo.");
    }

    return ArchivoFicha.fromDatabase(result.data);
  }

  // Busca archivos por el ID de la ficha
  async findByFichaId(id_ficha: string): Promise<ArchivoFicha[]> {
    const query = {
      name: "find-archivos-by-ficha-id",
      text: "SELECT * FROM archivos_ficha WHERE id_ficha = $1 ORDER BY created_at DESC",
      values: [id_ficha],
    };

    const results = await ReadQuery.execute<ArchivoFichaData>(query);
    return results.map((row) => ArchivoFicha.fromDatabase(row));
  }
}