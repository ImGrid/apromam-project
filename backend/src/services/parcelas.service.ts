import { ParcelaRepository } from "../repositories/ParcelaRepository.js";
import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { Parcela } from "../entities/Parcela.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateParcelaInput,
  UpdateParcelaInput,
  ParcelaResponse,
  ParcelasEstadisticas,
} from "../schemas/parcelas.schema.js";

const logger = createAuthLogger();

// Service para gestion de parcelas
// Incluye validacion de acceso por comunidad del productor
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
  // Valida acceso segun rol y comunidad
  async listParcelasByProductor(
    codigoProductor: string,
    usuarioComunidadesIds?: string[],
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

    // Si es tecnico, validar acceso a la comunidad
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      if (!usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a este productor");
      }
    }

    const parcelas = await this.parcelaRepository.findByProductor(
      codigoProductor
    );

    // NOTA: superficie_total ahora viene del productor, no de la suma de parcelas
    const superficieTotal = productor.superficieTotal;

    return {
      parcelas: parcelas.map((p) => p.toJSON()),
      total: parcelas.length,
      superficie_total: superficieTotal,
    };
  }

  // Obtiene una parcela por ID
  // Valida acceso segun rol
  async getParcelaById(
    id: string,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<ParcelaResponse> {
    const parcela = await this.parcelaRepository.findById(id);

    if (!parcela) {
      throw new Error("Parcela no encontrada");
    }

    // Si es tecnico, validar acceso a la comunidad del productor
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        parcela.codigoProductor
      );

      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a esta parcela");
      }
    }

    return parcela.toJSON();
  }

  // Crea una nueva parcela
  // Tecnico solo puede crear en su comunidad
  async createParcela(
    input: CreateParcelaInput,
    usuarioComunidadesIds?: string[],
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

    // Si es tecnico, validar que sea de su comunidad
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      if (!usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error(
          "No puede crear parcelas para productores de otra comunidad"
        );
      }
    }

    // Crear entity (sin superficie_ha, ya no existe)
    const parcela = Parcela.create({
      codigo_productor: input.codigo_productor,
      numero_parcela: input.numero_parcela,
      superficie_ha: input.superficie_ha,
      latitud_sud: input.coordenadas?.latitud,
      longitud_oeste: input.coordenadas?.longitud,
      utiliza_riego: input.utiliza_riego,
      tipo_barrera: input.tipo_barrera,
      insumos_organicos: input.insumos_organicos,
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
  // Tecnico solo puede actualizar en su comunidad
  async updateParcela(
    id: string,
    input: UpdateParcelaInput,
    usuarioComunidadesIds?: string[],
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

    // Si es tecnico, validar acceso
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const productor = await this.productorRepository.findByCodigo(
        parcelaActual.codigoProductor
      );

      if (!productor || !usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No puede actualizar parcelas de otra comunidad");
      }
    }

    // Aplicar cambios
    if (input.coordenadas) {
      parcelaActual.actualizarCoordenadas(
        input.coordenadas.latitud,
        input.coordenadas.longitud
      );
    }

    if (input.utiliza_riego !== undefined) {
      parcelaActual.actualizarRiego(input.utiliza_riego);
    }

    if (input.tipo_barrera) {
      parcelaActual.actualizarBarrera(input.tipo_barrera);
    }

    if (input.insumos_organicos !== undefined) {
      parcelaActual.actualizarInsumosOrganicos(input.insumos_organicos);
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

  // Obtiene estadisticas de parcelas
  async getEstadisticas(
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<ParcelasEstadisticas> {
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      // Estadisticas solo de sus comunidades asignadas
      const productores = await this.productorRepository.findByComunidades(
        usuarioComunidadesIds
      );

      let total = 0;
      let conCoordenadas = 0;
      let sinCoordenadas = 0;
      let conRiego = 0;

      for (const productor of productores) {
        const parcelas = await this.parcelaRepository.findByProductor(
          productor.codigo
        );

        total += parcelas.length;
        conCoordenadas += parcelas.filter((p) => p.tieneCoordenadas()).length;
        sinCoordenadas += parcelas.filter((p) => !p.tieneCoordenadas()).length;
        conRiego += parcelas.filter((p) => p.utilizaRiego).length;
      }

      return {
        total,
        con_coordenadas: conCoordenadas,
        sin_coordenadas: sinCoordenadas,
        con_riego: conRiego,
      };
    } else {
      // Estadisticas globales
      return await this.parcelaRepository.getEstadisticas();
    }
  }

  // Lista parcelas sin coordenadas
  async listParcelasSinCoordenadas(
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<{ parcelas: ParcelaResponse[]; total: number; superficie_total: number }> {
    let parcelas = await this.parcelaRepository.findWithoutCoordinates();

    // Si es tecnico, filtrar por su comunidad
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      const parcelasFiltradas: Parcela[] = [];

      for (const parcela of parcelas) {
        const productor = await this.productorRepository.findByCodigo(
          parcela.codigoProductor
        );

        if (productor && usuarioComunidadesIds.includes(productor.idComunidad)) {
          parcelasFiltradas.push(parcela);
        }
      }

      parcelas = parcelasFiltradas;
    }

    // Calcular superficie total de las parcelas sin coordenadas
    const superficieTotal = parcelas.reduce((suma, parcela) => {
      return suma + parcela.superficieHa;
    }, 0);

    return {
      parcelas: parcelas.map((p) => p.toJSON()),
      total: parcelas.length,
      superficie_total: superficieTotal,
    };
  }
}
