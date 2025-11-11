import { PoolClient, QueryResult, QueryResultRow } from "pg";
import { executeQuery, getPoolClient } from "../config/database.js";
import { createDatabaseLogger } from "../utils/logger.js";

// Logger especifico para operaciones de consultas
const logger = createDatabaseLogger();

// Interfaz para parametros de consulta SQL
interface QueryParams {
  text: string;
  values?: any[];
  name?: string;
}

// Interfaz para resultado de operaciones de escritura
interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}

// Clase para consultas de solo lectura (SELECT)
// Usa pool.query automatico para mejor rendimiento
export class ReadQuery {
  // Ejecuta consulta SELECT basica
  // Maneja automaticamente la conexion del pool
  static async execute<T = any>(query: QueryParams): Promise<T[]> {
    try {
      logger.debug(
        {
          nombre_consulta: query.name || "sin_nombre",
          preview_consulta: query.text.substring(0, 100),
          cantidad_parametros: query.values?.length || 0,
        },
        "Ejecutando consulta lectura"
      );

      const result = await executeQuery<T>(query.text, query.values);

      logger.debug(
        {
          nombre_consulta: query.name || "sin_nombre",
          filas_retornadas: result.length,
        },
        "Consulta lectura ejecutada correctamente"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          nombre_consulta: query.name || "sin_nombre",
          error: error instanceof Error ? error.message : "Error desconocido",
          preview_consulta: query.text.substring(0, 100),
        },
        "Error ejecutando consulta lectura"
      );

      throw error;
    }
  }

  // Ejecuta consulta SELECT que retorna un solo registro
  // Devuelve null si no encuentra nada
  static async findOne<T = any>(query: QueryParams): Promise<T | null> {
    const results = await this.execute<T>(query);
    return results.length > 0 ? results[0] : null;
  }

  // Ejecuta consulta SELECT con paginacion
  // Incluye conteo total para paginadores de interfaz
  static async paginated<T = any>(
    query: QueryParams,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const currentParamsCount = query.values?.length || 0;

    // Consulta con limite y offset para paginacion
    const paginatedQuery: QueryParams = {
      text: `${query.text} LIMIT $${currentParamsCount + 1} OFFSET $${
        currentParamsCount + 2
      }`,
      values: query.values ? [...query.values, limit, offset] : [limit, offset],
      name: query.name,
    };

    // Consulta para contar total de registros
    const countQuery: QueryParams = {
      text: `SELECT COUNT(*) as total FROM (${query.text}) as subquery_conteo`,
      values: query.values,
      name: query.name ? `${query.name}_conteo` : undefined,
    };

    try {
      const [data, countResult] = await Promise.all([
        this.execute<T>(paginatedQuery),
        this.execute<{ total: string }>(countQuery),
      ]);

      const total = parseInt(countResult[0]?.total || "0", 10);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error(
        {
          nombre_consulta: query.name || "sin_nombre",
          pagina: page,
          limite: limit,
          error: error instanceof Error ? error.message : "Error desconocido",
        },
        "Error ejecutando consulta paginada"
      );

      throw error;
    }
  }
}

// Clase para consultas de escritura (INSERT, UPDATE, DELETE)
// Usa conexiones dedicadas para mejor control de errores
export class WriteQuery {
  // Ejecuta consulta de escritura simple
  // Retorna numero de filas afectadas
  static async execute(query: QueryParams): Promise<TransactionResult> {
    let client: PoolClient | null = null;

    try {
      logger.debug(
        {
          nombre_consulta: query.name || "sin_nombre",
          preview_consulta: query.text.substring(0, 100),
          cantidad_parametros: query.values?.length || 0,
        },
        "Ejecutando consulta escritura"
      );

      client = await getPoolClient();
      const result = await client.query(query.text, query.values);

      logger.info(
        {
          nombre_consulta: query.name || "sin_nombre",
          filas_afectadas: result.rowCount || 0,
        },
        "Consulta escritura ejecutada correctamente"
      );

      return {
        success: true,
        data: result.rows,
        affectedRows: result.rowCount || 0,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      logger.error(
        {
          nombre_consulta: query.name || "sin_nombre",
          error: errorMessage,
          preview_consulta: query.text.substring(0, 100),
        },
        "Error ejecutando consulta escritura"
      );

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Ejecuta INSERT y retorna el registro creado
  // Usa clausula RETURNING para obtener datos actualizados
  static async insert<T = any>(
    query: QueryParams
  ): Promise<TransactionResult<T>> {
    // Agregar RETURNING * si no esta presente
    const returningQuery = {
      ...query,
      text: query.text.includes("RETURNING")
        ? query.text
        : `${query.text} RETURNING *`,
    };

    const result = await this.execute(returningQuery);

    return {
      ...result,
      data: Array.isArray(result.data) ? result.data[0] : result.data,
    };
  }

  // Ejecuta UPDATE y retorna los registros modificados
  static async update<T = any>(
    query: QueryParams
  ): Promise<TransactionResult<T[]>> {
    const returningQuery = {
      ...query,
      text: query.text.includes("RETURNING")
        ? query.text
        : `${query.text} RETURNING *`,
    };

    return this.execute(returningQuery);
  }
}

// Clase para transacciones complejas
// Maneja rollback automatico en caso de errores
export class Transaction {
  private client: PoolClient | null = null;
  private isActive: boolean = false;

  // Inicia transaccion nueva
  // Obtiene cliente dedicado del pool de conexiones
  async begin(): Promise<void> {
    try {
      this.client = await getPoolClient();
      await this.client.query("BEGIN");
      this.isActive = true;

      logger.debug(
        {
          cliente_id: (this.client as any).processID || "desconocido",
        },
        "Transaccion iniciada"
      );
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Error desconocido",
        },
        "Error iniciando transaccion"
      );

      if (this.client) {
        this.client.release();
        this.client = null;
      }

      throw error;
    }
  }

  // Ejecuta consulta dentro de la transaccion
  async query<T extends QueryResultRow = any>(
    query: QueryParams
  ): Promise<QueryResult<T>> {
    if (!this.client || !this.isActive) {
      throw new Error("Transaccion no activa. Llama begin() primero.");
    }

    try {
      logger.debug(
        {
          nombre_consulta: query.name || "sin_nombre",
          preview_consulta: query.text.substring(0, 100),
          cantidad_parametros: query.values?.length || 0,
        },
        "Ejecutando consulta en transaccion"
      );

      const result = await this.client.query<T>(query.text, query.values);

      logger.debug(
        {
          nombre_consulta: query.name || "sin_nombre",
          filas_afectadas: result.rowCount || 0,
        },
        "Consulta transaccional ejecutada correctamente"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          nombre_consulta: query.name || "sin_nombre",
          error: error instanceof Error ? error.message : "Error desconocido",
          preview_consulta: query.text.substring(0, 100),
        },
        "Error ejecutando consulta transaccional"
      );

      throw error;
    }
  }

  // Confirma transaccion
  // Ejecuta COMMIT y libera cliente
  async commit(): Promise<void> {
    if (!this.client || !this.isActive) {
      throw new Error("Transaccion no activa. No se puede confirmar.");
    }

    try {
      await this.client.query("COMMIT");
      this.isActive = false;

      logger.info(
        {
          cliente_id: (this.client as any).processID || "desconocido",
        },
        "Transaccion confirmada correctamente"
      );
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Error desconocido",
        },
        "Error confirmando transaccion"
      );

      throw error;
    } finally {
      this.client.release();
      this.client = null;
    }
  }

  // Cancela transaccion
  // Ejecuta ROLLBACK y libera cliente
  async rollback(): Promise<void> {
    if (!this.client) {
      return; // Ya fue liberado
    }

    try {
      if (this.isActive) {
        await this.client.query("ROLLBACK");
        this.isActive = false;
      }

      logger.info(
        {
          cliente_id: (this.client as any).processID || "desconocido",
        },
        "Transaccion cancelada"
      );
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Error desconocido",
        },
        "Error cancelando transaccion"
      );
    } finally {
      this.client.release();
      this.client = null;
    }
  }

  // Ejecuta multiples consultas en transaccion
  // Rollback automatico si alguna consulta falla
  static async execute<T extends QueryResultRow = any>(
    queries: QueryParams[]
  ): Promise<TransactionResult<T[]>> {
    const transaction = new Transaction();

    try {
      await transaction.begin();

      const results: QueryResult<T>[] = [];
      for (const query of queries) {
        const result = await transaction.query<T>(query);
        results.push(result);
      }

      await transaction.commit();

      const combinedData = results.flatMap((r) => r.rows);
      const totalAffectedRows = results.reduce(
        (sum, r) => sum + (r.rowCount || 0),
        0
      );

      return {
        success: true,
        data: combinedData,
        affectedRows: totalAffectedRows,
      };
    } catch (error) {
      await transaction.rollback();

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      logger.error(
        {
          error: errorMessage,
          cantidad_consultas: queries.length,
        },
        "Error ejecutando transaccion multiple"
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

