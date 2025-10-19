import { DepartamentoRepository } from "../repositories/DepartamentoRepository.js";
import { ProvinciaRepository } from "../repositories/ProvinciaRepository.js";
import { MunicipioRepository } from "../repositories/MunicipioRepository.js";
import { Departamento } from "../entities/Departamento.js";
import { Provincia } from "../entities/Provincia.js";
import { Municipio } from "../entities/Municipio.js";
import { createAuthLogger } from "../utils/logger.js";
import type {
  CreateDepartamentoInput,
  UpdateDepartamentoInput,
  DepartamentoResponse,
  CreateProvinciaInput,
  UpdateProvinciaInput,
  ProvinciaResponse,
  CreateMunicipioInput,
  UpdateMunicipioInput,
  MunicipioResponse,
} from "../schemas/geograficas.schema.js";

const logger = createAuthLogger();

// Service para gestion de la jerarquia geografica
// Departamentos, Provincias y Municipios
export class GeograficasService {
  private departamentoRepository: DepartamentoRepository;
  private provinciaRepository: ProvinciaRepository;
  private municipioRepository: MunicipioRepository;

  constructor(
    departamentoRepository: DepartamentoRepository,
    provinciaRepository: ProvinciaRepository,
    municipioRepository: MunicipioRepository
  ) {
    this.departamentoRepository = departamentoRepository;
    this.provinciaRepository = provinciaRepository;
    this.municipioRepository = municipioRepository;
  }

  // DEPARTAMENTOS

  // Lista todos los departamentos
  async listDepartamentos(): Promise<{
    departamentos: DepartamentoResponse[];
    total: number;
  }> {
    const departamentos = await this.departamentoRepository.findAll();

    return {
      departamentos: departamentos.map((d) => d.toJSON()),
      total: departamentos.length,
    };
  }

  // Obtiene un departamento por ID
  async getDepartamentoById(id: string): Promise<DepartamentoResponse> {
    const departamento = await this.departamentoRepository.findById(id);

    if (!departamento) {
      throw new Error("Departamento no encontrado");
    }

    return departamento.toJSON();
  }

  // Crea un nuevo departamento
  // Solo admin y gerente pueden crear
  async createDepartamento(
    input: CreateDepartamentoInput
  ): Promise<DepartamentoResponse> {
    logger.info(
      {
        nombre: input.nombre_departamento,
      },
      "Creating departamento"
    );

    const departamento = Departamento.create({
      nombre_departamento: input.nombre_departamento,
    });

    const departamentoCreado = await this.departamentoRepository.create(
      departamento
    );

    logger.info(
      {
        departamento_id: departamentoCreado.id,
        nombre: departamentoCreado.nombre,
      },
      "Departamento created successfully"
    );

    return departamentoCreado.toJSON();
  }

  // Actualiza un departamento existente
  // Solo admin y gerente pueden actualizar
  async updateDepartamento(
    id: string,
    input: UpdateDepartamentoInput
  ): Promise<DepartamentoResponse> {
    logger.info(
      {
        departamento_id: id,
        updates: input,
      },
      "Updating departamento"
    );

    const departamentoActual = await this.departamentoRepository.findById(id);
    if (!departamentoActual) {
      throw new Error("Departamento no encontrado");
    }

    // Aplicar cambios
    if (input.nombre_departamento) {
      departamentoActual.actualizarNombre(input.nombre_departamento);
    }

    if (input.activo !== undefined) {
      departamentoActual.actualizarEstado(input.activo);
    }

    const departamentoActualizado = await this.departamentoRepository.update(
      id,
      departamentoActual
    );

    logger.info(
      {
        departamento_id: id,
      },
      "Departamento updated successfully"
    );

    return departamentoActualizado.toJSON();
  }

  // Elimina (desactiva) un departamento
  // Solo admin y gerente pueden eliminar
  async deleteDepartamento(id: string): Promise<void> {
    logger.info(
      {
        departamento_id: id,
      },
      "Deleting departamento"
    );

    await this.departamentoRepository.delete(id);

    logger.info(
      {
        departamento_id: id,
      },
      "Departamento deleted successfully"
    );
  }

  // PROVINCIAS

  // Lista todas las provincias
  async listProvincias(): Promise<{
    provincias: ProvinciaResponse[];
    total: number;
  }> {
    const provincias = await this.provinciaRepository.findAll();

    return {
      provincias: provincias.map((p) => p.toJSON()),
      total: provincias.length,
    };
  }

  // Obtiene una provincia por ID
  async getProvinciaById(id: string): Promise<ProvinciaResponse> {
    const provincia = await this.provinciaRepository.findById(id);

    if (!provincia) {
      throw new Error("Provincia no encontrada");
    }

    return provincia.toJSON();
  }

  // Crea una nueva provincia
  // Solo admin puede crear
  async createProvincia(
    input: CreateProvinciaInput
  ): Promise<ProvinciaResponse> {
    logger.info(
      {
        nombre: input.nombre_provincia,
        departamento_id: input.id_departamento,
      },
      "Creating provincia"
    );

    // Verificar que el departamento existe
    const departamento = await this.departamentoRepository.findById(
      input.id_departamento
    );
    if (!departamento) {
      throw new Error("Departamento no encontrado");
    }

    const provincia = Provincia.create({
      nombre_provincia: input.nombre_provincia,
      id_departamento: input.id_departamento,
    });

    const provinciaCreada = await this.provinciaRepository.create(provincia);

    logger.info(
      {
        provincia_id: provinciaCreada.id,
        nombre: provinciaCreada.nombre,
      },
      "Provincia created successfully"
    );

    return provinciaCreada.toJSON();
  }

  // Actualiza una provincia existente
  // Solo admin puede actualizar
  async updateProvincia(
    id: string,
    input: UpdateProvinciaInput
  ): Promise<ProvinciaResponse> {
    logger.info(
      {
        provincia_id: id,
        updates: input,
      },
      "Updating provincia"
    );

    const provinciaActual = await this.provinciaRepository.findById(id);
    if (!provinciaActual) {
      throw new Error("Provincia no encontrada");
    }

    // Aplicar cambios
    if (input.nombre_provincia) {
      provinciaActual.actualizarNombre(input.nombre_provincia);
    }

    if (input.activo !== undefined) {
      provinciaActual.actualizarEstado(input.activo);
    }

    const provinciaActualizada = await this.provinciaRepository.update(
      id,
      provinciaActual
    );

    logger.info(
      {
        provincia_id: id,
      },
      "Provincia updated successfully"
    );

    return provinciaActualizada.toJSON();
  }

  // Elimina (desactiva) una provincia
  // Solo admin puede eliminar
  async deleteProvincia(id: string): Promise<void> {
    logger.info(
      {
        provincia_id: id,
      },
      "Deleting provincia"
    );

    await this.provinciaRepository.softDelete(id);

    logger.info(
      {
        provincia_id: id,
      },
      "Provincia deleted successfully"
    );
  }

  // MUNICIPIOS

  // Lista municipios con filtro opcional por provincia
  async listMunicipios(
    provinciaId?: string
  ): Promise<{ municipios: MunicipioResponse[]; total: number }> {
    let municipios: Municipio[];

    if (provinciaId) {
      municipios = await this.municipioRepository.findByProvincia(provinciaId);
    } else {
      municipios = await this.municipioRepository.findAll();
    }

    return {
      municipios: municipios.map((m) => m.toJSON()),
      total: municipios.length,
    };
  }

  // Obtiene un municipio por ID
  async getMunicipioById(id: string): Promise<MunicipioResponse> {
    const municipio = await this.municipioRepository.findById(id);

    if (!municipio) {
      throw new Error("Municipio no encontrado");
    }

    return municipio.toJSON();
  }

  // Crea un nuevo municipio
  // Solo admin puede crear
  async createMunicipio(
    input: CreateMunicipioInput
  ): Promise<MunicipioResponse> {
    logger.info(
      {
        nombre: input.nombre_municipio,
        provincia_id: input.id_provincia,
      },
      "Creating municipio"
    );

    // Verificar que la provincia existe
    const provincia = await this.provinciaRepository.findById(
      input.id_provincia
    );
    if (!provincia) {
      throw new Error("Provincia no encontrada");
    }

    const municipio = Municipio.create({
      id_provincia: input.id_provincia,
      nombre_municipio: input.nombre_municipio,
    });

    const municipioCreado = await this.municipioRepository.create(municipio);

    logger.info(
      {
        municipio_id: municipioCreado.id,
        nombre: municipioCreado.nombre,
      },
      "Municipio created successfully"
    );

    return municipioCreado.toJSON();
  }

  // Actualiza un municipio existente
  // Solo admin puede actualizar
  async updateMunicipio(
    id: string,
    input: UpdateMunicipioInput
  ): Promise<MunicipioResponse> {
    logger.info(
      {
        municipio_id: id,
        updates: input,
      },
      "Updating municipio"
    );

    const municipioActual = await this.municipioRepository.findById(id);
    if (!municipioActual) {
      throw new Error("Municipio no encontrado");
    }

    // Aplicar cambios
    if (input.nombre_municipio) {
      municipioActual.actualizarNombre(input.nombre_municipio);
    }

    if (input.activo !== undefined) {
      municipioActual.actualizarEstado(input.activo);
    }

    const municipioActualizado = await this.municipioRepository.update(
      id,
      municipioActual
    );

    logger.info(
      {
        municipio_id: id,
      },
      "Municipio updated successfully"
    );

    return municipioActualizado.toJSON();
  }

  // Elimina (desactiva) un municipio
  // Solo admin puede eliminar
  async deleteMunicipio(id: string): Promise<void> {
    logger.info(
      {
        municipio_id: id,
      },
      "Deleting municipio"
    );

    await this.municipioRepository.softDelete(id);

    logger.info(
      {
        municipio_id: id,
      },
      "Municipio deleted successfully"
    );
  }
}
