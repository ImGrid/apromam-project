import { FastifyRequest, FastifyReply } from "fastify";
import { GestionRepository } from "../repositories/GestionRepository.js";
import { createAuthLogger } from "../utils/logger.js";

const logger = createAuthLogger();

/**
 * Middleware para inyectar la gestión activa del sistema en cada request
 * La gestión activa es aquella que tiene activo_sistema = true
 *
 * Este middleware se ejecuta en todas las rutas protegidas y añade:
 * - request.gestionActiva: objeto Gestion completo
 *
 * Si no hay gestión activa en el sistema, devuelve error 500
 */
export async function gestionActivaMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    console.log("[GESTION-MIDDLEWARE] 🔍 Iniciando obtención de gestión activa...");

    const gestionRepository = new GestionRepository();
    const gestionActiva = await gestionRepository.getGestionActiva();

    if (!gestionActiva) {
      console.log("[GESTION-MIDDLEWARE] ❌ NO HAY GESTIÓN ACTIVA en la BD");

      logger.error(
        {
          path: request.url,
          method: request.method,
        },
        "No existe gestión activa en el sistema"
      );

      return reply.status(500).send({
        error: "NO_ACTIVE_GESTION",
        message:
          "No hay gestión activa configurada en el sistema. Contacte al administrador.",
      });
    }

    console.log("[GESTION-MIDDLEWARE] ✅ Gestión activa obtenida:", {
      id: gestionActiva.id,
      anio: gestionActiva.anio,
      activo_sistema: gestionActiva.activoSistema,
    });

    // Inyectar gestión activa en el request
    (request as any).gestionActiva = gestionActiva;

    console.log("[GESTION-MIDDLEWARE] 💉 Gestión inyectada en request.gestionActiva");

    logger.debug(
      {
        path: request.url,
        method: request.method,
        gestion_id: gestionActiva.id,
        anio_gestion: gestionActiva.anio,
      },
      "Gestión activa inyectada en request"
    );
  } catch (error) {
    console.log("[GESTION-MIDDLEWARE] 💥 ERROR al obtener gestión activa:", error);

    logger.error(
      {
        error,
        path: request.url,
        method: request.method,
      },
      "Error al obtener gestión activa"
    );

    return reply.status(500).send({
      error: "GESTION_MIDDLEWARE_ERROR",
      message: "Error al obtener la gestión activa del sistema",
    });
  }
}
