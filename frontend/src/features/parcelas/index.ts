/**
 * Parcelas Feature Module
 * Exporta servicios y tipos relacionados con parcelas
 */

// Services
export { parcelasService } from "./services/parcelas.service";

// Types
export type {
  Parcela,
  ParcelaCoordenadas,
  ParcelasProductorResponse,
  CreateParcelaInput,
  UpdateParcelaInput,
} from "./services/parcelas.service";
