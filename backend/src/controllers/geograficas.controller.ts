import { FastifyRequest, FastifyReply } from "fastify";
import { GeograficasService } from "../services/geograficas.service.js";
import type {
  CreateProvinciaInput,
  UpdateProvinciaInput,
  CreateMunicipioInput,
  UpdateMunicipioInput,
  GeograficaParams,
  GeograficaQuery,
} from "../schemas/geograficas.schema.js";

// Controlador para endpoints de la jerarquia geografica
// Gestiona provincias y municipios
// Solo admin puede crear, actualizar o eliminar
export class GeograficasController {
  constructor(private geograficasService: GeograficasService) {}

  // PROVINCIAS

  // GET /api/geograficas/provincias
  // Lista todas las provincias
  // Acceso: todos los roles autenticados
  async listProvincias(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.geograficasService.listProvincias();
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing provincias");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar provincias",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/geograficas/provincias/:id
  // Obtiene una provincia por ID
  // Acceso: todos los roles autenticados
  async getProvinciaById(
    request: FastifyRequest<{ Params: GeograficaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const provincia = await this.geograficasService.getProvinciaById(id);
      return reply.status(200).send({ provincia });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Provincia no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Provincia no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting provincia");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener provincia",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/geograficas/provincias
  // Crea una nueva provincia
  // Acceso: solo admin
  async createProvincia(
    request: FastifyRequest<{ Body: CreateProvinciaInput }>,
    reply: FastifyReply
  ) {
    try {
      const provincia = await this.geograficasService.createProvincia(
        request.body
      );
      return reply.status(201).send({
        provincia,
        message: "Provincia creada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ya existe")) {
        return reply.status(409).send({
          error: "conflict",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error creating provincia");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear provincia",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/geograficas/provincias/:id
  // Actualiza una provincia existente
  // Acceso: solo admin
  async updateProvincia(
    request: FastifyRequest<{
      Params: GeograficaParams;
      Body: UpdateProvinciaInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const provincia = await this.geograficasService.updateProvincia(
        id,
        request.body
      );
      return reply.status(200).send({
        provincia,
        message: "Provincia actualizada exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Provincia no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Provincia no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error updating provincia");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar provincia",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/geograficas/provincias/:id
  // Elimina (desactiva) una provincia
  // Acceso: solo admin
  async deleteProvincia(
    request: FastifyRequest<{ Params: GeograficaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.geograficasService.deleteProvincia(id);
      return reply.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Provincia no encontrada" ||
          error.message.includes("tiene"))
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting provincia");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar provincia",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // MUNICIPIOS

  // GET /api/geograficas/municipios
  // Lista municipios con filtro opcional por provincia
  // Acceso: todos los roles autenticados
  async listMunicipios(
    request: FastifyRequest<{ Querystring: GeograficaQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { provincia } = request.query;
      const result = await this.geograficasService.listMunicipios(provincia);
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, "Error listing municipios");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al listar municipios",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GET /api/geograficas/municipios/:id
  // Obtiene un municipio por ID
  // Acceso: todos los roles autenticados
  async getMunicipioById(
    request: FastifyRequest<{ Params: GeograficaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const municipio = await this.geograficasService.getMunicipioById(id);
      return reply.status(200).send({ municipio });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Municipio no encontrado"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Municipio no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error getting municipio");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al obtener municipio",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // POST /api/geograficas/municipios
  // Crea un nuevo municipio
  // Acceso: solo admin
  async createMunicipio(
    request: FastifyRequest<{ Body: CreateMunicipioInput }>,
    reply: FastifyReply
  ) {
    try {
      const municipio = await this.geograficasService.createMunicipio(
        request.body
      );
      return reply.status(201).send({
        municipio,
        message: "Municipio creado exitosamente",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Ya existe")) {
        return reply.status(409).send({
          error: "conflict",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      if (
        error instanceof Error &&
        error.message === "Provincia no encontrada"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Provincia no encontrada",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error creating municipio");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al crear municipio",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // PUT /api/geograficas/municipios/:id
  // Actualiza un municipio existente
  // Acceso: solo admin
  async updateMunicipio(
    request: FastifyRequest<{
      Params: GeograficaParams;
      Body: UpdateMunicipioInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const municipio = await this.geograficasService.updateMunicipio(
        id,
        request.body
      );
      return reply.status(200).send({
        municipio,
        message: "Municipio actualizado exitosamente",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Municipio no encontrado"
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: "Municipio no encontrado",
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error updating municipio");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al actualizar municipio",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // DELETE /api/geograficas/municipios/:id
  // Elimina (desactiva) un municipio
  // Acceso: solo admin
  async deleteMunicipio(
    request: FastifyRequest<{ Params: GeograficaParams }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      await this.geograficasService.deleteMunicipio(id);
      return reply.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Municipio no encontrado" ||
          error.message.includes("tiene"))
      ) {
        return reply.status(404).send({
          error: "not_found",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
      request.log.error(error, "Error deleting municipio");
      return reply.status(500).send({
        error: "internal_server_error",
        message: "Error al eliminar municipio",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
