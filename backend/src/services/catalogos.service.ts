import { TipoCultivoRepository } from "../repositories/TipoCultivoRepository.js";
import { TipoCultivo } from "../entities/TipoCultivo.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  TipoCultivoResponse,
} from "../schemas/catalogos.schema.js";

const logger = createAuthLogger();

/**
 * Service para gestión de catálogos (solo tipos de cultivo)
 * NOTA: Gestiones ahora tienen su propio servicio en gestiones.service.ts
 */
export class CatalogosService {
  private tipoCultivoRepository: TipoCultivoRepository;

  constructor(tipoCultivoRepository: TipoCultivoRepository) {
    this.tipoCultivoRepository = tipoCultivoRepository;
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
}
