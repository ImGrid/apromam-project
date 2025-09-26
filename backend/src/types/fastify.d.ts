import "@fastify/jwt";

/**
 * Extensión de tipos Fastify para APROMAM
 * Define la estructura del usuario autenticado en request.user
 */
declare module "fastify" {
  interface FastifyRequest {
    user: {
      userId: string;
      username: string;
      role: string;
      comunidadId?: string;
      permisos?: Record<string, any>;
    };
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
