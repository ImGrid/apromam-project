import { Pool } from "pg";
import { createDatabaseLogger } from "../utils/logger.js";

const logger = createDatabaseLogger();
let postgisInitialized = false;

// Verificar que PostGIS esta instalado en la base de datos
export async function initializePostGIS(): Promise<void> {
  if (postgisInitialized) {
    logger.debug("PostGIS already initialized, skipping setup");
    return;
  }

  try {
    logger.info("Checking PostGIS availability...");

    const pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "apromam_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      max: 1,
    });

    // Verificar que PostGIS esta instalado
    const result = await pool.query(
      "SELECT PostGIS_Version() as version, PostGIS_Full_Version() as full_version"
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error("PostGIS extension is not installed in database");
    }

    const postgisVersion = result.rows[0].version;
    const fullVersion = result.rows[0].full_version;

    logger.info(
      {
        postgis_version: postgisVersion,
        postgis_full_version: fullVersion,
      },
      "PostGIS is available and ready"
    );

    await pool.end();

    postgisInitialized = true;
    logger.info("PostGIS initialization completed");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "PostGIS initialization failed"
    );
    throw error;
  }
}

// Verificar estado de inicializacion
export function isPostGISInitialized(): boolean {
  return postgisInitialized;
}
