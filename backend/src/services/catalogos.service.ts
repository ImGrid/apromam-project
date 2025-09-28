import { TipoCultivoRepository } from "../repositories/TipoCultivoRepository.js";
import { GestionRepository } from "../repositories/GestionRepository.js";
import { TipoCultivo } from "../entities/TipoCultivo.js";
import { Gestion } from "../entities/Gestion.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  TipoCultivoResponse,
  CreateGestionInput,
  UpdateGestionInput,
  GestionResponse,
} from "../schemas/catalogos.schema.js";

const logger = createAuthLogger();

/**
 * Service para gestión de catálogos
 */
export class CatalogosService {
  private tipoCultivoRepository: TipoCultivoRepository;
  private gestionRepository: GestionRepository;

  constructor(
    tipoCultivoRepository: TipoCultivoRepository,
    gestionRepository: GestionRepository
  ) {
    this.tipoCultivoRepository = tipoCultivoRepository;
    this.gestionRepository = gestionRepository;
  }

  // ==========================================
  // TIPOS CULTIVO
  // ==========================================

  /**
   * Lista todos los tipos de cultivo
   */
  async listTiposCultivo(
    soloActivos: boolean = true
  ): Promise<{ tipos_cultivo: TipoCultivoResponse[]; total: number }> {
    const tiposCultivo = await this.tipoCultivoRepository.findAll(soloActivos);

    return {
      tipos_cultivo: tiposCultivo.map((tc) => tc.toJSON()),
      total: tiposCultivo.length,
    };
  }

  /**
   * Obtiene un tipo cultivo por ID
   */
  async getTipoCultivoById(id: string): Promise<TipoCultivoResponse> {
    const tipoCultivo = await this.tipoCultivoRepository.findById(id);

    if (!tipoCultivo) {
      throw new Error("Tipo cultivo no encontrado");
    }

    return tipoCultivo.toJSON();
  }

  /**
   * Crea un nuevo tipo cultivo
   * Solo admin puede crear
   */
  async createTipoCultivo(
    input: CreateTipoCultivoInput
  ): Promise<TipoCultivoResponse> {
    logger.info(
      {
        nombre: input.nombre_cultivo, // ✅ Corregido: era nombre_tipo_cultivo
      },
      "Creating tipo cultivo"
    );

    const tipoCultivo = TipoCultivo.create({
      nombre_cultivo: input.nombre_cultivo,
      descripcion: input.descripcion,
      es_principal_certificable: input.es_principal_certificable,
      rendimiento_promedio_qq_ha: input.rendimiento_promedio_qq_ha,
    });

    const tipoCultivoCreado = await this.tipoCultivoRepository.create(
      tipoCultivo
    );

    logger.info(
      {
        tipo_cultivo_id: tipoCultivoCreado.id,
        nombre: tipoCultivoCreado.nombre,
      },
      "Tipo cultivo created successfully"
    );

    return tipoCultivoCreado.toJSON();
  }

  /**
   * Actualiza un tipo cultivo existente
   * Solo admin puede actualizar
   */
  async updateTipoCultivo(
    id: string,
    input: UpdateTipoCultivoInput
  ): Promise<TipoCultivoResponse> {
    logger.info(
      {
        tipo_cultivo_id: id,
        updates: input,
      },
      "Updating tipo cultivo"
    );

    const tipoCultivoActual = await this.tipoCultivoRepository.findById(id);
    if (!tipoCultivoActual) {
      throw new Error("Tipo cultivo no encontrado");
    }

    // Aplicar cambios
    if (input.nombre_cultivo) {
      tipoCultivoActual.actualizarNombre(input.nombre_cultivo);
    }

    if (input.descripcion !== undefined) {
      tipoCultivoActual.actualizarDescripcion(input.descripcion);
    }

    if (input.es_principal_certificable !== undefined) {
      tipoCultivoActual.actualizarPrincipalCertificable(
        input.es_principal_certificable
      );
    }

    if (input.rendimiento_promedio_qq_ha) {
      tipoCultivoActual.actualizarRendimiento(input.rendimiento_promedio_qq_ha);
    }

    if (input.activo !== undefined) {
      if (input.activo) {
        tipoCultivoActual.activar();
      } else {
        tipoCultivoActual.desactivar();
      }
    }

    const tipoCultivoActualizado = await this.tipoCultivoRepository.update(
      id,
      tipoCultivoActual
    );

    logger.info(
      {
        tipo_cultivo_id: id,
      },
      "Tipo cultivo updated successfully"
    );

    return tipoCultivoActualizado.toJSON();
  }

  /**
   * Elimina (desactiva) un tipo cultivo
   * Solo admin puede eliminar
   */
  async deleteTipoCultivo(id: string): Promise<void> {
    logger.info(
      {
        tipo_cultivo_id: id,
      },
      "Deleting tipo cultivo"
    );

    await this.tipoCultivoRepository.softDelete(id);

    logger.info(
      {
        tipo_cultivo_id: id,
      },
      "Tipo cultivo deleted successfully"
    );
  }

  // ==========================================
  // GESTIONES
  // ==========================================

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
   * Obtiene la gestión actual (año actual)
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

    const gestion = Gestion.create({
      anio_gestion: input.anio_gestion,
      descripcion: input.descripcion, // ✅ Corregido: era nombre_gestion
      fecha_inicio: input.fecha_inicio
        ? new Date(input.fecha_inicio)
        : undefined,
      fecha_fin: input.fecha_fin ? new Date(input.fecha_fin) : undefined,
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
    if (input.descripcion) {
      gestionActual.actualizarDescripcion(input.descripcion);
    }

    if (input.fecha_inicio && input.fecha_fin) {
      gestionActual.actualizarFechas(
        new Date(input.fecha_inicio),
        new Date(input.fecha_fin)
      );
    }

    if (input.estado_gestion) {
      gestionActual.actualizarEstado(input.estado_gestion);
    }

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

    await this.gestionRepository.softDelete(id);

    logger.info(
      {
        gestion_id: id,
      },
      "Gestion deleted successfully"
    );
  }
}
