import { GestionRepository } from "../repositories/GestionRepository.js";
import { Gestion } from "../entities/Gestion.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateGestionInput,
  UpdateGestionInput,
  GestionResponse,
} from "../schemas/catalogos.schema.js";

const logger = createAuthLogger();

/**
 * Service para gestión de gestiones (años agrícolas)
 * Gestiones es un módulo crítico del sistema que maneja los ciclos anuales
 */
export class GestionesService {
  private gestionRepository: GestionRepository;

  constructor(gestionRepository: GestionRepository) {
    this.gestionRepository = gestionRepository;
  }

  /**
   * Lista todas las gestiones
   */
  async listGestiones(
    soloActivas: boolean = true
  ): Promise<{ gestiones: GestionResponse[]; total: number }> {
    const gestiones = await this.gestionRepository.findAll(soloActivas);

    return {
      gestiones: gestiones.map((g) => g.toJSON()),
      total: gestiones.length,
    };
  }

  /**
   * Obtiene una gestión por ID
   */
  async getGestionById(id: string): Promise<GestionResponse> {
    const gestion = await this.gestionRepository.findById(id);

    if (!gestion) {
      throw new Error("Gestión no encontrada");
    }

    return gestion.toJSON();
  }

  /**
   * Obtiene la gestión activa del sistema (activo_sistema = true)
   */
  async getGestionActiva(): Promise<GestionResponse | null> {
    const gestion = await this.gestionRepository.getGestionActiva();
    return gestion ? gestion.toJSON() : null;
  }

  /**
   * Obtiene la gestión del año actual
   */
  async getGestionActual(): Promise<GestionResponse | null> {
    const gestion = await this.gestionRepository.findActual();
    return gestion ? gestion.toJSON() : null;
  }

  /**
   * Crea una nueva gestión
   * Solo admin puede crear
   */
  async createGestion(input: CreateGestionInput): Promise<GestionResponse> {
    logger.info(
      {
        anio: input.anio_gestion,
      },
      "Creating gestion"
    );

    // Verificar que no exista ya una gestión para ese año
    const gestionExistente = await this.gestionRepository.findByAnio(
      input.anio_gestion
    );
    if (gestionExistente) {
      throw new Error(
        `Ya existe una gestión para el año ${input.anio_gestion}`
      );
    }

    const gestion = Gestion.create({
      anio_gestion: input.anio_gestion,
    });

    const gestionCreada = await this.gestionRepository.create(gestion);

    logger.info(
      {
        gestion_id: gestionCreada.id,
        anio: gestionCreada.anio,
      },
      "Gestion created successfully"
    );

    return gestionCreada.toJSON();
  }

  /**
   * Actualiza una gestión existente
   * Solo admin puede actualizar
   */
  async updateGestion(
    id: string,
    input: UpdateGestionInput
  ): Promise<GestionResponse> {
    logger.info(
      {
        gestion_id: id,
        updates: input,
      },
      "Updating gestion"
    );

    const gestionActual = await this.gestionRepository.findById(id);
    if (!gestionActual) {
      throw new Error("Gestión no encontrada");
    }

    // Aplicar cambios
    if (input.activa !== undefined) {
      if (input.activa) {
        gestionActual.activar();
      } else {
        gestionActual.desactivar();
      }
    }

    const gestionActualizada = await this.gestionRepository.update(
      id,
      gestionActual
    );

    logger.info(
      {
        gestion_id: id,
      },
      "Gestion updated successfully"
    );

    return gestionActualizada.toJSON();
  }

  /**
   * Elimina (desactiva) una gestión
   * Solo admin puede eliminar
   */
  async deleteGestion(id: string): Promise<void> {
    logger.info(
      {
        gestion_id: id,
      },
      "Deleting gestion"
    );

    // Verificar que no sea la gestión activa del sistema
    const gestionActiva = await this.gestionRepository.getGestionActiva();
    if (gestionActiva && gestionActiva.id === id) {
      throw new Error(
        "No se puede eliminar la gestión activa del sistema. Primero active otra gestión."
      );
    }

    await this.gestionRepository.softDelete(id);

    logger.info(
      {
        gestion_id: id,
      },
      "Gestion deleted successfully"
    );
  }

  /**
   * Establece una gestión como activa en el sistema
   * Solo una gestión puede estar activa a la vez
   * IMPORTANTE: Este cambio afecta a todo el sistema
   */
  async activarGestion(id: string, usuarioId: string): Promise<GestionResponse> {
    logger.info(
      {
        gestion_id: id,
        usuario_id: usuarioId,
      },
      "Activating gestion"
    );

    // Verificar que la gestión existe
    const gestion = await this.gestionRepository.findById(id);
    if (!gestion) {
      throw new Error("Gestión no encontrada");
    }

    // Verificar que la gestión esté activa (no eliminada)
    // El campo 'activa' determina si la gestión está activa o desactivada (soft delete)
    if (!gestion.activa) {
      throw new Error(
        "No se puede activar una gestión desactivada. Primero reactive la gestión."
      );
    }

    // Obtener gestión activa anterior para logging
    const gestionAnterior = await this.gestionRepository.getGestionActiva();

    // Establecer como activa (esto desactiva automáticamente las demás)
    const gestionActivada = await this.gestionRepository.setGestionActiva(id);

    logger.warn(
      {
        gestion_anterior: gestionAnterior
          ? {
              id: gestionAnterior.id,
              anio: gestionAnterior.anio,
            }
          : null,
        gestion_nueva: {
          id: gestionActivada.id,
          anio: gestionActivada.anio,
        },
        usuario_id: usuarioId,
      },
      "Gestion activa del sistema cambiada - ACCIÓN CRÍTICA"
    );

    return gestionActivada.toJSON();
  }
}
