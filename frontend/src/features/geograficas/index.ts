// frontend/src/features/geograficas/index.ts

export { GeograficasManagePage } from "./pages/GeograficasManagePage";
export { ProvinciasTable } from "./components/ProvinciasTable";
export { MunicipiosTable } from "./components/MunicipiosTable";
export { ProvinciasSelect } from "./components/ProvinciasSelect";
export { MunicipiosSelect } from "./components/MunicipiosSelect";
export { GeograficasCascade } from "./components/GeograficasCascade";
export { ComunidadesSelect } from "./components/ComunidadesSelect";
export { CreateProvinciaModal } from "./components/CreateProvinciaModal";
export { CreateMunicipioModal } from "./components/CreateMunicipioModal";
export { useProvincias } from "./hooks/useProvincias";
export { useMunicipios } from "./hooks/useMunicipios";
export { geograficasService } from "./services/geograficas.service";
export type * from "./types/geografica.types";
