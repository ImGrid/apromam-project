import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ComunidadRepository } from "../repositories/ComunidadRepository.js";
import { Productor } from "../entities/Productor.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateProductorInput,
  UpdateProductorInput,
  ProductorResponse,
  ProximitySearchInput,
} from "../schemas/productores.schema.js";

const logger = createAuthLogger();

// Service para gestion de productores
// Incluye validacion de acceso por comunidad
export class ProductoresService {
  private productorRepository: ProductorRepository;
  private comunidadRepository: ComunidadRepository;

  constructor(
    productorRepository: ProductorRepository,
    comunidadRepository: ComunidadRepository
  ) {
    this.productorRepository = productorRepository;
    this.comunidadRepository = comunidadRepository;
  }

  // Lista productores con filtros
  // Tecnico: solo su comunidad
  // Gerente/Admin: todas las comunidades
  async listProductores(
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false,
    comunidadId?: string,
    categoria?: string
  ): Promise<{ productores: ProductorResponse[]; total: number }> {
    let productores: Productor[];

    // Si es tecnico, filtrar solo su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      productores = await this.productorRepository.findByComunidad(
        usuarioComunidadId
      );
    }
    // Si es admin/gerente y especifica comunidad
    else if (comunidadId) {
      productores = await this.productorRepository.findByComunidad(comunidadId);
    }
    // Admin/gerente sin filtro de comunidad
    else {
      productores = await this.productorRepository.findAll(categoria);
    }

    return {
      productores: productores.map((p) => p.toJSON()),
      total: productores.length,
    };
  }

  // Obtiene un productor por codigo
  // Valida acceso segun rol
  async getProductorByCodigo(
    codigo: string,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ProductorResponse> {
    const productor = await this.productorRepository.findByCodigo(codigo);

    if (!productor) {
      throw new Error("Productor no encontrado");
    }

    // Validar acceso si es tecnico
    if (!esAdminOGerente && usuarioComunidadId) {
      if (productor.idComunidad !== usuarioComunidadId) {
        throw new Error("No tiene acceso a este productor");
      }
    }

    return productor.toJSON();
  }

  // Busca productores cercanos a una ubicacion
  // Usa funciones PostGIS
  async searchNearby(
    input: ProximitySearchInput,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<{ productores: ProductorResponse[]; total: number }> {
    logger.info(
      {
        latitude: input.latitud,
        longitude: input.longitud,
        radius: input.radio_metros,
      },
      "Searching nearby productores"
    );

    let productores = await this.productorRepository.findNearby(
      input.latitud,
      input.longitud,
      input.radio_metros
    );

    // Si es tecnico, filtrar solo su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      productores = productores.filter(
        (p) => p.idComunidad === usuarioComunidadId
      );
    }

    return {
      productores: productores.map((p) => p.toJSON()),
      total: productores.length,
    };
  }

  // Crea un nuevo productor
  // Tecnico solo puede crear en su comunidad
  async createProductor(
    input: CreateProductorInput,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ProductorResponse> {
    logger.info(
      {
        codigo: input.codigo_productor,
        comunidad_id: input.id_comunidad,
      },
      "Creating productor"
    );

    // Verificar que la comunidad existe
    const comunidad = await this.comunidadRepository.findById(
      input.id_comunidad
    );
    if (!comunidad) {
      throw new Error("Comunidad no encontrada");
    }

    // Si es tecnico, validar que sea su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      if (input.id_comunidad !== usuarioComunidadId) {
        throw new Error("No puede crear productores en otra comunidad");
      }
    }

    // Crear entity
    const productor = Productor.create({
      codigo_productor: input.codigo_productor,
      nombre_productor: input.nombre_productor,
      ci_documento: input.ci_documento,
      id_comunidad: input.id_comunidad,
      año_ingreso_programa: input.año_ingreso_programa,
      categoria_actual: input.categoria_actual,
      superficie_total_has: input.superficie_total_has,
      numero_parcelas_total: input.numero_parcelas_total,
      latitud_domicilio: input.coordenadas?.latitud,
      longitud_domicilio: input.coordenadas?.longitud,
      altitud_domicilio: input.coordenadas?.altitud,
    });

    const productorCreado = await this.productorRepository.create(productor);

    logger.info(
      {
        codigo: productorCreado.codigo,
        nombre: productorCreado.nombre,
      },
      "Productor created successfully"
    );

    return productorCreado.toJSON();
  }

  // Actualiza un productor existente
  // Tecnico solo puede actualizar en su comunidad
  async updateProductor(
    codigo: string,
    input: UpdateProductorInput,
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<ProductorResponse> {
    logger.info(
      {
        codigo: codigo,
        updates: input,
      },
      "Updating productor"
    );

    const productorActual = await this.productorRepository.findByCodigo(codigo);
    if (!productorActual) {
      throw new Error("Productor no encontrado");
    }

    // Si es tecnico, validar que sea de su comunidad
    if (!esAdminOGerente && usuarioComunidadId) {
      if (productorActual.idComunidad !== usuarioComunidadId) {
        throw new Error("No puede actualizar productores de otra comunidad");
      }
    }

    // Aplicar cambios
    if (input.nombre_productor) {
      productorActual.actualizarNombre(input.nombre_productor);
    }

    if (input.categoria_actual) {
      productorActual.actualizarCategoria(input.categoria_actual);
    }

    if (input.superficie_total_has !== undefined) {
      productorActual.actualizarSuperficie(input.superficie_total_has);
    }

    if (input.numero_parcelas_total !== undefined) {
      productorActual.actualizarParcelas(input.numero_parcelas_total);
    }

    if (input.coordenadas) {
      productorActual.actualizarCoordenadas(
        input.coordenadas.latitud,
        input.coordenadas.longitud,
        input.coordenadas.altitud
      );
    }

    if (input.activo !== undefined) {
      if (input.activo) {
        productorActual.activar();
      } else {
        productorActual.desactivar();
      }
    }

    const productorActualizado = await this.productorRepository.update(
      codigo,
      productorActual
    );

    logger.info(
      {
        codigo: codigo,
      },
      "Productor updated successfully"
    );

    return productorActualizado.toJSON();
  }

  // Elimina (desactiva) un productor
  // Solo admin puede eliminar
  async deleteProductor(codigo: string): Promise<void> {
    logger.info(
      {
        codigo: codigo,
      },
      "Deleting productor"
    );

    await this.productorRepository.softDelete(codigo);

    logger.info(
      {
        codigo: codigo,
      },
      "Productor deleted successfully"
    );
  }

  // Obtiene estadisticas de productores
  async getEstadisticas(
    usuarioComunidadId?: string,
    esAdminOGerente: boolean = false
  ): Promise<{
    total: number;
    por_categoria: Record<string, number>;
    con_coordenadas: number;
  }> {
    const categorias = ["E", "2T", "1T", "0T"];
    const porCategoria: Record<string, number> = {};

    if (!esAdminOGerente && usuarioComunidadId) {
      // Estadisticas solo de su comunidad
      const productores = await this.productorRepository.findByComunidad(
        usuarioComunidadId
      );

      for (const cat of categorias) {
        porCategoria[cat] = productores.filter(
          (p) => p.categoriaActual === cat
        ).length;
      }

      return {
        total: productores.length,
        por_categoria: porCategoria,
        con_coordenadas: productores.filter((p) => p.tieneCoordenadas()).length,
      };
    } else {
      // Estadisticas globales
      const total = (await this.productorRepository.findAll()).length;

      for (const cat of categorias) {
        porCategoria[cat] = await this.productorRepository.countByCategoria(
          cat
        );
      }

      const conCoordenadas =
        await this.productorRepository.countWithCoordinates();

      return {
        total,
        por_categoria: porCategoria,
        con_coordenadas: conCoordenadas,
      };
    }
  }
}
