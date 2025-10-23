/**
 * Entity para borradores de fichas de inspección
 * Representa un borrador temporal antes de crear la ficha oficial
 */

export interface FichaDraft {
  id_draft: string;
  codigo_productor: string;
  gestion: number;
  draft_data: any;
  step_actual: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFichaDraftInput {
  codigo_productor: string;
  gestion: number;
  draft_data: any;
  step_actual: number;
  created_by: string;
}

export interface UpdateFichaDraftInput {
  draft_data?: any;
  step_actual?: number;
}

/**
 * Clase FichaDraft con métodos de dominio
 */
export class FichaDraftEntity implements FichaDraft {
  id_draft: string;
  codigo_productor: string;
  gestion: number;
  draft_data: any;
  step_actual: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: FichaDraft) {
    this.id_draft = data.id_draft;
    this.codigo_productor = data.codigo_productor;
    this.gestion = data.gestion;
    this.draft_data = data.draft_data;
    this.step_actual = data.step_actual;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Verifica si el borrador pertenece a un usuario
  belongsToUser(userId: string): boolean {
    return this.created_by === userId;
  }

  // Calcula hace cuánto tiempo se actualizó
  getTimeSinceUpdate(): number {
    return Date.now() - this.updated_at.getTime();
  }

  // Verifica si el borrador es antiguo (más de 30 días)
  isOld(): boolean {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return this.getTimeSinceUpdate() > thirtyDaysInMs;
  }

  // Convierte a formato JSON para respuesta
  toJSON() {
    return {
      id_draft: this.id_draft,
      codigo_productor: this.codigo_productor,
      gestion: this.gestion,
      draft_data: this.draft_data,
      step_actual: this.step_actual,
      created_by: this.created_by,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    };
  }
}
