/**
 * Feature: Configuración
 * Exportación centralizada de todo el módulo
 */

// Types
export type { Gestion, CreateGestionInput, UpdateGestionInput } from "./types/gestion.types";

// Services
export { gestionesService } from "./services/gestiones.service";

// Hooks
export {
  useGestionActiva,
  useActivarGestion,
  useGestiones,
  useCreateGestion,
  useUpdateGestion
} from "./hooks";

// Components
export {
  GestionIndicator,
  GestionActivaCard,
  GestionesTable,
  CreateGestionModal,
  EditGestionModal
} from "./components";

// Pages
export { ConfiguracionPage } from "./pages";
