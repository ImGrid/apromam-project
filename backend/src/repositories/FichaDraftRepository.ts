/**
 * Repositorio para operaciones de base de datos con fichas_draft
 */

import { ReadQuery, WriteQuery } from '../config/connection.js';
import {
  FichaDraft,
  CreateFichaDraftInput,
  UpdateFichaDraftInput,
} from '../entities/FichaDraft.js';
import logger from '../utils/logger.js';

export class FichaDraftRepository {

  /**
   * Guarda o actualiza un borrador
   * Si ya existe para ese productor/gestión/usuario, lo actualiza
   */
  async upsert(input: CreateFichaDraftInput): Promise<FichaDraft> {
    const query = {
      name: 'upsert-ficha-draft',
      text: `
        INSERT INTO fichas_draft (
          codigo_productor,
          gestion,
          draft_data,
          step_actual,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (codigo_productor, gestion, created_by)
        DO UPDATE SET
          draft_data = EXCLUDED.draft_data,
          step_actual = EXCLUDED.step_actual,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
      values: [
        input.codigo_productor,
        input.gestion,
        JSON.stringify(input.draft_data),
        input.step_actual,
        input.created_by,
      ],
    };

    try {
      const result = await WriteQuery.insert<FichaDraft>(query);

      if (!result.success || !result.data) {
        throw new Error('No se pudo guardar el borrador');
      }

      logger.info(`Borrador guardado: ${input.codigo_productor}-${input.gestion}`);
      return result.data;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          codigo_productor: input.codigo_productor,
          gestion: input.gestion,
        },
        'Error en FichaDraftRepository.upsert'
      );
      throw error;
    }
  }

  /**
   * Busca un borrador por código de productor, gestión y usuario
   */
  async findByProductorGestionUser(
    codigoProductor: string,
    gestion: number,
    userId: string
  ): Promise<FichaDraft | null> {
    const query = {
      name: 'find-draft-by-productor-gestion-user',
      text: `
        SELECT * FROM fichas_draft
        WHERE codigo_productor = $1
          AND gestion = $2
          AND created_by = $3
      `,
      values: [codigoProductor, gestion, userId],
    };

    try {
      const result = await ReadQuery.findOne<FichaDraft>(query);
      return result;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          codigo_productor: codigoProductor,
          gestion: gestion,
        },
        'Error en FichaDraftRepository.findByProductorGestionUser'
      );
      throw error;
    }
  }

  /**
   * Busca un borrador por ID
   */
  async findById(idDraft: string): Promise<FichaDraft | null> {
    const query = {
      name: 'find-draft-by-id',
      text: `
        SELECT * FROM fichas_draft
        WHERE id_draft = $1
      `,
      values: [idDraft],
    };

    try {
      const result = await ReadQuery.findOne<FichaDraft>(query);
      return result;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          id_draft: idDraft,
        },
        'Error en FichaDraftRepository.findById'
      );
      throw error;
    }
  }

  /**
   * Lista todos los borradores de un usuario
   */
  async findByUser(userId: string): Promise<FichaDraft[]> {
    const query = {
      name: 'find-drafts-by-user',
      text: `
        SELECT * FROM fichas_draft
        WHERE created_by = $1
        ORDER BY updated_at DESC
      `,
      values: [userId],
    };

    try {
      const result = await ReadQuery.execute<FichaDraft>(query);
      return result;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          user_id: userId,
        },
        'Error en FichaDraftRepository.findByUser'
      );
      throw error;
    }
  }

  /**
   * Elimina un borrador por ID
   */
  async delete(idDraft: string): Promise<void> {
    const query = {
      name: 'delete-draft',
      text: `
        DELETE FROM fichas_draft
        WHERE id_draft = $1
      `,
      values: [idDraft],
    };

    try {
      await WriteQuery.execute(query);
      logger.info(`Borrador eliminado: ${idDraft}`);
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          id_draft: idDraft,
        },
        'Error en FichaDraftRepository.delete'
      );
      throw error;
    }
  }

  /**
   * Elimina un borrador por código de productor, gestión y usuario
   */
  async deleteDraft(
    codigoProductor: string,
    gestion: number,
    userId: string
  ): Promise<void> {
    const query = {
      name: 'delete-draft-by-productor-gestion-user',
      text: `
        DELETE FROM fichas_draft
        WHERE codigo_productor = $1
          AND gestion = $2
          AND created_by = $3
      `,
      values: [codigoProductor, gestion, userId],
    };

    try {
      await WriteQuery.execute(query);
      logger.info(`Borrador eliminado: ${codigoProductor}-${gestion}`);
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          codigo_productor: codigoProductor,
          gestion: gestion,
        },
        'Error en FichaDraftRepository.deleteDraft'
      );
      throw error;
    }
  }

  /**
   * Elimina borradores antiguos (más de 30 días)
   */
  async deleteOldDrafts(): Promise<number> {
    const query = {
      name: 'delete-old-drafts',
      text: `
        DELETE FROM fichas_draft
        WHERE updated_at < NOW() - INTERVAL '30 days'
        RETURNING id_draft
      `,
      values: [],
    };

    try {
      const result = await WriteQuery.execute(query);
      const count = result.affectedRows || 0;

      logger.info(`Borradores antiguos eliminados: ${count}`);
      return count;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Error en FichaDraftRepository.deleteOldDrafts'
      );
      throw error;
    }
  }

  /**
   * Actualiza un borrador existente
   */
  async update(
    idDraft: string,
    input: UpdateFichaDraftInput
  ): Promise<FichaDraft> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.draft_data !== undefined) {
      updates.push(`draft_data = $${paramCount}`);
      values.push(JSON.stringify(input.draft_data));
      paramCount++;
    }

    if (input.step_actual !== undefined) {
      updates.push(`step_actual = $${paramCount}`);
      values.push(input.step_actual);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(idDraft);

    const query = {
      name: 'update-draft',
      text: `
        UPDATE fichas_draft
        SET ${updates.join(', ')}
        WHERE id_draft = $${paramCount}
        RETURNING *
      `,
      values: values,
    };

    try {
      const result = await WriteQuery.update<FichaDraft>(query);

      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('Borrador no encontrado');
      }

      logger.info(`Borrador actualizado: ${idDraft}`);
      return result.data[0];
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          id_draft: idDraft,
        },
        'Error en FichaDraftRepository.update'
      );
      throw error;
    }
  }
}
