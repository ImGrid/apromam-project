import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ReportesController } from "../controllers/reportes.controller.js";
import { ReporteService } from "../services/reporte.service.js";
import { ReporteRepository } from "../repositories/ReporteRepository.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

const reportesRoutes: FastifyPluginAsyncZod = async (fastify, _opts) => {
  // Instanciar repositories
  const reporteRepository = new ReporteRepository();

  // Instanciar services
  const reporteService = new ReporteService(reporteRepository);

  // Instanciar controller
  const reportesController = new ReportesController(
    reporteService,
    reporteRepository
  );

  // GET /api/reportes/productores-organicos
  // Descarga reporte Excel de productores organicos
  // Solo admin y gerente
  fastify.route({
    method: "GET",
    url: "/productores-organicos",
    onRequest: [authenticate, requireRoles("administrador", "gerente")],
    handler: reportesController.descargarReporteProductores.bind(reportesController) as any,
  });
};

export default reportesRoutes;
