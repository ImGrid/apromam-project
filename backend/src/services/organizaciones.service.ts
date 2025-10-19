import { OrganizacionRepository } from "../repositories/OrganizacionRepository.js";
import { Organizacion } from "../entities/Organizacion.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateOrganizacionInput,
  UpdateOrganizacionInput,
  OrganizacionResponse,
} from "../schemas/organizaciones.schema.js";

const logger = createAuthLogger();

// Service para gestion de organizaciones
// Las organizaciones son independientes de la jerarquia geografica
export class OrganizacionesService {
  private organizacionRepository: OrganizacionRepository;

  constructor(organizacionRepository: OrganizacionRepository) {
    this.organizacionRepository = organizacionRepository;
  }

  // Lista todas las organizaciones
  async listOrganizaciones(): Promise<{
    organizaciones: OrganizacionResponse[];
    total: number;
  }> {
    const organizaciones = await this.organizacionRepository.findAll();

    return {
      organizaciones: organizaciones.map((o) => o.toJSON()),
      total: organizaciones.length,
    };
  }

  // Obtiene una organizacion por ID
  async getOrganizacionById(id: string): Promise<OrganizacionResponse> {
    const organizacion = await this.organizacionRepository.findById(id);

    if (!organizacion) {
      throw new Error("Organización no encontrada");
    }

    return organizacion.toJSON();
  }

  // Crea una nueva organizacion
  // Solo admin y gerente pueden crear
  async createOrganizacion(
    input: CreateOrganizacionInput
  ): Promise<OrganizacionResponse> {
    logger.info(
      {
        nombre: input.nombre_organizacion,
        abreviatura: input.abreviatura_organizacion,
      },
      "Creating organizacion"
    );

    const organizacion = Organizacion.create({
      nombre_organizacion: input.nombre_organizacion,
      abreviatura_organizacion: input.abreviatura_organizacion,
    });

    const organizacionCreada = await this.organizacionRepository.create(
      organizacion
    );

    logger.info(
      {
        organizacion_id: organizacionCreada.id,
        nombre: organizacionCreada.nombre,
        abreviatura: organizacionCreada.abreviatura,
      },
      "Organizacion created successfully"
    );

    return organizacionCreada.toJSON();
  }

  // Actualiza una organizacion existente
  // Solo admin y gerente pueden actualizar
  async updateOrganizacion(
    id: string,
    input: UpdateOrganizacionInput
  ): Promise<OrganizacionResponse> {
    logger.info(
      {
        organizacion_id: id,
        updates: input,
      },
      "Updating organizacion"
    );

    const organizacionActual = await this.organizacionRepository.findById(id);
    if (!organizacionActual) {
      throw new Error("Organización no encontrada");
    }

    // Aplicar cambios
    if (input.nombre_organizacion) {
      organizacionActual.actualizarNombre(input.nombre_organizacion);
    }

    if (input.abreviatura_organizacion) {
      organizacionActual.actualizarAbreviatura(input.abreviatura_organizacion);
    }

    if (input.activo !== undefined) {
      organizacionActual.actualizarEstado(input.activo);
    }

    const organizacionActualizada = await this.organizacionRepository.update(
      id,
      organizacionActual
    );

    logger.info(
      {
        organizacion_id: id,
      },
      "Organizacion updated successfully"
    );

    return organizacionActualizada.toJSON();
  }

  // Elimina (desactiva) una organizacion
  // Solo admin y gerente pueden eliminar
  async deleteOrganizacion(id: string): Promise<void> {
    logger.info(
      {
        organizacion_id: id,
      },
      "Deleting organizacion"
    );

    await this.organizacionRepository.delete(id);

    logger.info(
      {
        organizacion_id: id,
      },
      "Organizacion deleted successfully"
    );
  }
}
