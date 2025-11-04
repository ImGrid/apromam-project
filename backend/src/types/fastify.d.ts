import "@fastify/jwt";
import type { Gestion } from "../entities/Gestion.js";

/**
 * Extensión de tipos Fastify para APROMAM
 * Define la estructura del usuario autenticado en request.user
 * y la gestión activa en request.gestionActiva
 *
 * user es opcional porque solo existe en rutas protegidas
 * gestionActiva es opcional porque solo existe cuando el middleware está activo
 */
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      username: string;
      role: string;
      comunidadId?: string;
      permisos?: Record<string, any>;
    };
    gestionActiva?: Gestion;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      userId: string;
      username: string;
      role: string;
      comunidadId?: string;
      type: "access" | "refresh";
    };
  }
}
