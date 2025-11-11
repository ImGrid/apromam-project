import { ProductorRepository } from "../repositories/ProductorRepository.js";
import { ComunidadRepository } from "../repositories/ComunidadRepository.js";
import { OrganizacionRepository } from "../repositories/OrganizacionRepository.js";
import { Productor } from "../entities/Productor.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateProductorInput,
  UpdateProductorInput,
  ProductorResponse,
} from "../schemas/productores.schema.js";

const logger = createAuthLogger();

// Service para gestion de productores
// Incluye validacion de acceso por comunidad
export class ProductoresService {
  private productorRepository: ProductorRepository;
  private comunidadRepository: ComunidadRepository;
  private organizacionRepository: OrganizacionRepository;

  constructor(
    productorRepository: ProductorRepository,
    comunidadRepository: ComunidadRepository,
    organizacionRepository: OrganizacionRepository
  ) {
    this.productorRepository = productorRepository;
    this.comunidadRepository = comunidadRepository;
    this.organizacionRepository = organizacionRepository;
  }

  // Lista productores con filtros
  // Tecnico: solo sus comunidades asignadas
  // Gerente/Admin: todas las comunidades
  async listProductores(
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false,
    comunidadId?: string,
    categoria?: string
  ): Promise<{ productores: ProductorResponse[]; total: number }> {
    let productores: Productor[];

    // Si es tecnico, filtrar por sus comunidades asignadas
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      productores = await this.productorRepository.findByComunidades(
        usuarioComunidadesIds
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
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<ProductorResponse> {
    const productor = await this.productorRepository.findByCodigo(codigo);

    if (!productor) {
      throw new Error("Productor no encontrado");
    }

    // Validar acceso si es tecnico
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      if (!usuarioComunidadesIds.includes(productor.idComunidad)) {
        throw new Error("No tiene acceso a este productor");
      }
    }

    return productor.toJSON();
  }

  // Crea un nuevo productor
  // Tecnico solo puede crear en sus comunidades asignadas
  async createProductor(
    input: CreateProductorInput,
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<ProductorResponse> {
    logger.info(
      {
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

    // Verificar que la organizacion existe
    const organizacion = await this.organizacionRepository.findById(
      input.id_organizacion
    );
    if (!organizacion) {
      throw new Error("Organización no encontrada");
    }

    // Si es tecnico, validar que sea una de sus comunidades asignadas
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      if (!usuarioComunidadesIds.includes(input.id_comunidad)) {
        throw new Error("No puede crear productores en otra comunidad");
      }
    }

    // Generar codigo automatico con organizacion
    const codigoGenerado =
      await this.productorRepository.getNextCodigoByComunidad(
        input.id_comunidad,
        comunidad.abreviatura,
        organizacion.abreviatura
      );

    logger.info(
      {
        codigo_generado: codigoGenerado,
        comunidad: comunidad.nombre,
      },
      "Codigo productor generado"
    );

    // Crear entity
    const productor = Productor.create({
      nombre_productor: input.nombre_productor,
      ci_documento: input.ci_documento,
      id_comunidad: input.id_comunidad,
      id_organizacion: input.id_organizacion,
      año_ingreso_programa: input.año_ingreso_programa,
      categoria_actual: input.categoria_actual,
      superficie_total_has: input.superficie_total_has,
      numero_parcelas_total: input.numero_parcelas_total,
      latitud_domicilio: input.coordenadas?.latitud,
      longitud_domicilio: input.coordenadas?.longitud,
      altitud_domicilio: input.coordenadas?.altitud,
    });

    // Asignar codigo generado
    productor.asignarCodigo(codigoGenerado);

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
  // Tecnico solo puede actualizar en sus comunidades asignadas
  async updateProductor(
    codigo: string,
    input: UpdateProductorInput,
    usuarioComunidadesIds?: string[],
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

    // Si es tecnico, validar que sea de una de sus comunidades asignadas
    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      if (!usuarioComunidadesIds.includes(productorActual.idComunidad)) {
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
    usuarioComunidadesIds?: string[],
    esAdminOGerente: boolean = false
  ): Promise<{
    total: number;
    por_categoria: Record<string, number>;
    con_coordenadas: number;
  }> {
    const categorias = ["E", "T2", "T1", "T0"];
    const porCategoria: Record<string, number> = {};

    if (!esAdminOGerente && usuarioComunidadesIds && usuarioComunidadesIds.length > 0) {
      // Estadisticas solo de sus comunidades asignadas
      const productores = await this.productorRepository.findByComunidades(
        usuarioComunidadesIds
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
