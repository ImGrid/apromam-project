/**
 * Módulo de Catálogos (solo Tipos de Cultivo)
 *
 * NOTA: Los exports de Gestiones están en features/configuracion
 */

// Hooks
export { useTiposCultivo } from "./hooks/useTiposCultivo";
export { useCreateTipoCultivo } from "./hooks/useCreateTipoCultivo";
export { useUpdateTipoCultivo } from "./hooks/useUpdateTipoCultivo";

// Components
export { TiposCultivoList } from "./components/TiposCultivoList";
export { CreateTipoCultivoModal } from "./components/CreateTipoCultivoModal";
export { EditTipoCultivoModal } from "./components/EditTipoCultivoModal";
export { TiposCultivoSelect } from "./components/TiposCultivoSelect";

// Services
export { catalogosService } from "./services/catalogos.service";

// Types
export type {
  TipoCultivo,
  CreateTipoCultivoInput,
  UpdateTipoCultivoInput,
  TiposCultivoListResponse,
  CatalogoFilters,
} from "./types/catalogo.types";
