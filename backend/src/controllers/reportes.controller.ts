import { FastifyRequest, FastifyReply } from "fastify";
import { createAuthLogger } from "../utils/logger.js";
import { ReporteService } from "../services/reporte.service.js";
import { ReporteRepository } from "../repositories/ReporteRepository.js";

const logger = createAuthLogger();

export class ReportesController {
  private reporteService: ReporteService;
  private reporteRepository: ReporteRepository;

  constructor(
    reporteService: ReporteService,
    reporteRepository: ReporteRepository
  ) {
    this.reporteService = reporteService;
    this.reporteRepository = reporteRepository;
  }

  // GET /api/reportes/productores-organicos
  // Descarga reporte Excel de productores organicos
  async descargarReporteProductores(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      logger.info(
        { usuario: request.user?.userId },
        "Descargando reporte de productores organicos"
      );

      // Obtener gestion activa para el nombre del archivo
      const gestionActiva = await this.reporteRepository.obtenerGestionActiva();

      // Generar Excel
      const buffer = await this.reporteService.generarReporteExcel();

      // Nombre del archivo
      const filename = `Reporte_Productores_Organicos_Gestion_${gestionActiva}.xlsx`;

      // Enviar archivo
      reply
        .type(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        .header("Content-Disposition", `attachment; filename="${filename}"`)
        .header("Content-Length", buffer.length)
        .send(buffer);

      logger.info(
        {
          usuario: request.user?.userId,
          gestion: gestionActiva,
          size_bytes: buffer.length,
        },
        "Reporte descargado exitosamente"
      );
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          usuario: request.user?.userId,
        },
        "Error al generar reporte"
      );

      reply.status(500).send({
        error: "Error al generar reporte",
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al generar reporte",
      });
    }
  }

}
