/**
 * Specialized Components for Fichas
 * Componentes especializados reutilizables para el sistema de fichas
 */

export { GPSCaptureButton } from "./GPSCaptureButton";
export {
  ComplianceRadioGroup,
  useComplianceStatus,
  type ComplianceStatus,
} from "./ComplianceRadioGroup";
export { FileUploadZone, type FileType } from "./FileUploadZone";
export {
  CategoriaBadge,
  CategoriaCard,
  getNextCategoria,
  getCategoriaLabel,
  type CategoriaGestion,
} from "./CategoriaBadge";
export {
  EstadoFichaBadge,
  EstadoFichaCard,
  isEditable,
  canSendToReview,
  canReview,
  getAvailableActions,
  getEstadoColor,
  type EstadoFicha,
} from "./EstadoFichaBadge";
export {
  DynamicCard,
  DynamicCardList,
  useExpandedCards,
} from "./DynamicCard";
export { FichaWorkflowActions } from "./FichaWorkflowActions";
export { FichaArchivosSection } from "./FichaArchivosSection";
