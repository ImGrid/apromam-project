import { ComunidadRepository } from "../repositories/ComunidadRepository.js";
import { Comunidad } from "../entities/Comunidad.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateComunidadInput,
  UpdateComunidadInput,
  ComunidadResponse,
} from "../schemas/comunidades.schema.js";

const logger = createAuthLogger();

// Service para gestion de comunidades
export class ComunidadesService {
  private comunidadRepository: ComunidadRepository;

  constructor(comunidadRepository: ComunidadRepository) {
    this.comunidadRepository = comunidadRepository;
  }

  // Lista todas las comunidades
  async listAll(
    municipioId?: string,
    provinciaId?: string,
    sinTecnicos?: boolean
  ): Promise<{ comunidades: ComunidadResponse[]; total: number }> {
    logger.debug(
      {
        municipio_id: municipioId,
        provincia_id: provinciaId,
        sin_tecnicos: sinTecnicos,
      },
      "Listing comunidades"
    );

    let comunidades: Comunidad[];

    if (sinTecnicos) {
      comunidades = await this.comunidadRepository.findWithoutTecnicos();
    } else if (municipioId) {
      comunidades = await this.comunidadRepository.findByMunicipio(municipioId);
    } else if (provinciaId) {
      comunidades = await this.comunidadRepository.findByProvincia(provinciaId);
    } else {
      comunidades = await this.comunidadRepository.findAll();
    }

    return {
      comunidades: comunidades.map((c) => c.toJSON()),
      total: comunidades.length,
    };
  }

  // Obtiene una comunidad por ID
  async getById(id: string): Promise<ComunidadResponse> {
    const comunidad = await this.comunidadRepository.findById(id);
    if (!comunidad) {
      throw new Error("Comunidad no encontrada");
    }

    return comunidad.toJSON();
  }

  // Crea una nueva comunidad
  // Solo admin puede crear
  async create(input: CreateComunidadInput): Promise<ComunidadResponse> {
    logger.info(
      {
        nombre: input.nombre_comunidad,
        abreviatura: input.abreviatura_comunidad,
        municipio_id: input.id_municipio,
      },
      "Creating comunidad"
    );

    // Crear entidad
    const comunidad = Comunidad.create({
      id_municipio: input.id_municipio,
      nombre_comunidad: input.nombre_comunidad,
      abreviatura_comunidad: input.abreviatura_comunidad,
    });

    // Guardar en BD
    const comunidadCreada = await this.comunidadRepository.create(comunidad);

    logger.info(
      {
        comunidad_id: comunidadCreada.id,
        nombre: comunidadCreada.nombre,
        abreviatura: comunidadCreada.abreviatura,
      },
      "Comunidad created successfully"
    );

    return comunidadCreada.toJSON();
  }

  // Actualiza una comunidad existente
  // Solo admin puede actualizar
  async update(
    id: string,
    input: UpdateComunidadInput
  ): Promise<ComunidadResponse> {
    logger.info(
      {
        comunidad_id: id,
        updates: input,
      },
      "Updating comunidad"
    );

    // Obtener comunidad actual
    const comunidadActual = await this.comunidadRepository.findById(id);
    if (!comunidadActual) {
      throw new Error("Comunidad no encontrada");
    }

    // Aplicar cambios
    if (input.nombre_comunidad) {
      comunidadActual.actualizarNombre(input.nombre_comunidad);
    }

    if (input.abreviatura_comunidad) {
      comunidadActual.actualizarAbreviatura(input.abreviatura_comunidad);
    }

    if (input.activo !== undefined) {
      if (input.activo) {
        comunidadActual.activar();
      } else {
        comunidadActual.desactivar();
      }
    }

    // Guardar cambios
    const comunidadActualizada = await this.comunidadRepository.update(
      id,
      comunidadActual
    );

    logger.info(
      {
        comunidad_id: id,
      },
      "Comunidad updated successfully"
    );

    return comunidadActualizada.toJSON();
  }

  // Elimina (desactiva) una comunidad
  // Solo admin puede eliminar
  async delete(id: string): Promise<void> {
    logger.info(
      {
        comunidad_id: id,
      },
      "Deleting comunidad"
    );

    await this.comunidadRepository.softDelete(id);

    logger.info(
      {
        comunidad_id: id,
      },
      "Comunidad deleted successfully"
    );
  }

  // Lista comunidades con tecnicos asignados
  async listWithTecnicos(): Promise<{
    comunidades: ComunidadResponse[];
    total: number;
  }> {
    const comunidades = await this.comunidadRepository.findWithTecnicos();
    return {
      comunidades: comunidades.map((c) => c.toJSON()),
      total: comunidades.length,
    };
  }

  // Lista comunidades sin tecnicos asignados
  async listWithoutTecnicos(): Promise<{
    comunidades: ComunidadResponse[];
    total: number;
  }> {
    const comunidades = await this.comunidadRepository.findWithoutTecnicos();
    return {
      comunidades: comunidades.map((c) => c.toJSON()),
      total: comunidades.length,
    };
  }
}
