/// <reference types="vite/client" />

// Tipos para las variables de entorno de Vite
// Esto proporciona autocompletado e IntelliSense para import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_FEATURE_OFFLINE_MODE?: string;
  readonly VITE_FEATURE_DEBUG_MODE?: string;
  readonly VITE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
