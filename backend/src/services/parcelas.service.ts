import { ParcelaRepository } from "../repositories/ParcelaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { Parcela } from "../entities/Parcela.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateParcelaInput,
  UpdateParcelaInput,
  ParcelaResponse,
  ProximitySearchParcelaInput,
  ParcelasEstadisticas,
} from "../schemas/parcelas.schema.js";

const logger = createAuthLogger();

// Service para gestión de parcelas
// Incluye validación de acceso por comunidad del productor
export class ParcelasService {
  private parcelaRepository: ParcelaRepository;
  private productorRepository: ProductorRepository;

  constructor(
    parcelaRepository: ParcelaRepository,
    productorRepository: ProductorRepository
  ) {
    this.parcelaRepository = parcelaRepository;
    this.productorRepository = productorRepository;
  }

  // Lista todas las parcelas de un productor
  // Valida acceso según rol y comunidad
  async listParcelasByProductor(
    codigoProductor: string,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<{
    parcelas: ParcelaResponse[];
    total: number;
    superficie_total: number;
  }> {
    // Verificar que el productor existe
    const productor = await this.productorRepository.findByCodigo(
      codigoProductor
    );

    if (!productor) {
      throw new Error("Productor no encontrado");
    }

    // Si es técnico, validar acceso a la comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      if (productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a este productor");
      }
    }

    const parcelas = await this.parcelaRepository.findByProductor(
      codigoProductor
    );

    const superficieTotal = parcelas.reduce((sum, p) => sum + p.superficie, 0);

    return {
      parcelas: parcelas.map((p) => p.toJSON()),
      total: parcelas.length,
      superficie_total: superficieTotal,
    };
  }

  // Obtiene una parcela por ID
  // Valida acceso según rol
  async getParcelaById(
    id: string,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ParcelaResponse> {
    const parcela = await this.parcelaRepository.findById(id);

    if (!parcela) {
      throw new Error("Parcela no encontrada");
    }

    // Si es técnico, validar acceso a la comunidad del productor
    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        parcela.codigoProductor
      );

      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a esta parcela");
      }
    }

    return parcela.toJSON();
  }

  // Busca parcelas cercanas a una ubicación
  async searchNearby(
    input: ProximitySearchParcelaInput,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<{ parcelas: ParcelaResponse[]; total: number }> {
    logger.info(
      {
        latitude: input.latitud,
        longitude: input.longitud,
        radius: input.radio_metros,
      },
      "Searching nearby parcelas"
    );

    let parcelas = await this.parcelaRepository.findNearby(
      input.latitud,
      input.longitud,
      input.radio_metros
    );

    // Si es técnico, filtrar solo parcelas de su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      const parcelasFiltradas: Parcela[] = [];

      for (const parcela of parcelas) {
        const productor = await this.productorRepository.findByCodigo(
          parcela.codigoProductor
        );

        if (productor && productor.idComunidad === usuarioComunidadId) {
          parcelasFiltradas.push(parcela);
        }
      }

      parcelas = parcelasFiltradas;
    }

    return {
      parcelas: parcelas.map((p) => p.toJSON()),
      total: parcelas.length,
    };
  }

  // Crea una nueva parcela
  // Técnico solo puede crear en su comunidad
  async createParcela(
    input: CreateParcelaInput,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ParcelaResponse> {
    logger.info(
      {
        codigo_productor: input.codigo_productor,
        numero_parcela: input.numero_parcela,
      },
      "Creating parcela"
    );

    // Verificar que el productor existe
    const productor = await this.productorRepository.findByCodigo(
      input.codigo_productor
    );

    if (!productor) {
      throw new Error("Productor no encontrado");
    }

    // Si es técnico, validar que sea de su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      if (productor.idComunidad !== usuarioComunidadId) {
        throw new Error(
          "No puede crear parcelas para productores de otra comunidad"
        );
      }
    }

    // Crear entity
    const parcela = Parcela.create({
      codigo_productor: input.codigo_productor,
      numero_parcela: input.numero_parcela,
      superficie_ha: input.superficie_ha,
      latitud_sud: input.coordenadas?.latitud,
      longitud_oeste: input.coordenadas?.longitud,
      precision_gps: input.coordenadas?.precision_gps,
      metodo_captura: input.metodo_captura,
      fecha_captura_coords: input.fecha_captura_coords
        ? new Date(input.fecha_captura_coords)
        : undefined,
      utiliza_riego: input.utiliza_riego,
      situacion_cumple: input.situacion_cumple,
      tipo_barrera: input.tipo_barrera,
      descripcion_barrera: input.descripcion_barrera,
    });

    const parcelaCreada = await this.parcelaRepository.create(parcela);

    logger.info(
      {
        id_parcela: parcelaCreada.id,
        codigo_productor: parcelaCreada.codigoProductor,
        numero: parcelaCreada.numeroParcela,
      },
      "Parcela created successfully"
    );

    return parcelaCreada.toJSON();
  }

  // Actualiza una parcela existente
  // Técnico solo puede actualizar en su comunidad
  async updateParcela(
    id: string,
    input: UpdateParcelaInput,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ParcelaResponse> {
    logger.info(
      {
        id_parcela: id,
        updates: input,
      },
      "Updating parcela"
    );

    const parcelaActual = await this.parcelaRepository.findById(id);
    if (!parcelaActual) {
      throw new Error("Parcela no encontrada");
    }

    // Si es técnico, validar acceso
    if (!esAdminOGerente && usuarioComunidadId) {
      const productor = await this.productorRepository.findByCodigo(
        parcelaActual.codigoProductor
      );

      if (!productor || productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No puede actualizar parcelas de otra comunidad");
      }
    }

    // Aplicar cambios
    if (input.superficie_ha !== undefined) {
      parcelaActual.actualizarSuperficie(input.superficie_ha);
    }

    if (input.coordenadas) {
      parcelaActual.actualizarCoordenadas(
        input.coordenadas.latitud,
        input.coordenadas.longitud,
        input.coordenadas.precision_gps,
        input.metodo_captura
      );
    }

    if (input.utiliza_riego !== undefined) {
      parcelaActual.actualizarRiego(input.utiliza_riego);
    }

    if (input.situacion_cumple !== undefined) {
      parcelaActual.actualizarSituacion(input.situacion_cumple);
    }

    if (input.tipo_barrera) {
      parcelaActual.actualizarBarrera(
        input.tipo_barrera,
        input.descripcion_barrera
      );
    }

    if (input.activo !== undefined) {
      if (input.activo) {
        parcelaActual.activar();
      } else {
        parcelaActual.desactivar();
      }
    }

    const parcelaActualizada = await this.parcelaRepository.update(
      id,
      parcelaActual
    );

    logger.info(
      {
        id_parcela: id,
      },
      "Parcela updated successfully"
    );

    return parcelaActualizada.toJSON();
  }

  // Elimina (desactiva) una parcela
  // Solo admin puede eliminar
  async deleteParcela(id: string): Promise<void> {
    logger.info(
      {
        id_parcela: id,
      },
      "Deleting parcela"
    );

    await this.parcelaRepository.softDelete(id);

    logger.info(
      {
        id_parcela: id,
      },
      "Parcela deleted successfully"
    );
  }

  // Obtiene estadísticas de parcelas
  async getEstadisticas(
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ParcelasEstadisticas> {
    if (!esAdminOGerente && usuarioComunidadId) {
      // Estadísticas solo de su comunidad
      // Obtener todos los productores de la comunidad
      const productores = await this.productorRepository.findByComunidad(
        usuarioComunidadId
      );

      let total = 0;
      let conCoordenadas = 0;
      let sinCoordenadas = 0;
      let superficieTotal = 0;
      let conRiego = 0;

      for (const productor of productores) {
        const parcelas = await this.parcelaRepository.findByProductor(
          productor.codigo
        );

        total += parcelas.length;
        conCoordenadas += parcelas.filter((p) => p.tieneCoordenadas()).length;
        sinCoordenadas += parcelas.filter((p) => !p.tieneCoordenadas()).length;
        superficieTotal += parcelas.reduce((sum, p) => sum + p.superficie, 0);
        conRiego += parcelas.filter((p) => p.utilizaRiego).length;
      }

      return {
        total,
        con_coordenadas: conCoordenadas,
        sin_coordenadas: sinCoordenadas,
        superficie_total: superficieTotal,
        con_riego: conRiego,
      };
    } else {
      // Estadísticas globales
      return await this.parcelaRepository.getEstadisticas();
    }
  }

  // Lista parcelas sin coordenadas
  async listParcelasSinCoordenadas(
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<{ parcelas: ParcelaResponse[]; total: number }> {
    let parcelas = await this.parcelaRepository.findWithoutCoordinates();

    // Si es técnico, filtrar por su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      const parcelasFiltradas: Parcela[] = [];

      for (const parcela of parcelas) {
        const productor = await this.productorRepository.findByCodigo(
          parcela.codigoProductor
        );

        if (productor && productor.idComunidad === usuarioComunidadId) {
          parcelasFiltradas.push(parcela);
        }
      }

      parcelas = parcelasFiltradas;
    }

    return {
      parcelas: parcelas.map((p) => p.toJSON()),
      total: parcelas.length,
    };
  }
}
