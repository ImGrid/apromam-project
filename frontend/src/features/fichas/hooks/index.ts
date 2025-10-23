/**
 * Fichas Hooks
 * Exportación centralizada de todos los hooks de fichas
 */

// CRUD Hooks
export { useFichas } from "./useFichas";
export { useFichaCompleta } from "./useFichaCompleta";
export { useCreateFicha } from "./useCreateFicha";
export { useUpdateFicha } from "./useUpdateFicha";

// Workflow Hooks
export { useEnviarRevision } from "./useEnviarRevision";
export { useAprobarFicha } from "./useAprobarFicha";
export { useRechazarFicha } from "./useRechazarFicha";

// File Upload Hook
export { useUploadArchivo } from "./useUploadArchivo";

// Draft Hooks
export { useAutoSaveDraft } from "./useAutoSaveDraft";
export { useRecoverDraft } from "./useRecoverDraft";
export { useMyDrafts } from "./useMyDrafts";

// Estadisticas Hook
export { useFichaEstadisticas } from "./useFichaEstadisticas";
