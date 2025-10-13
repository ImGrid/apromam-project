/**
 * Exportaciones del módulo de productores
 */

// Pages
export { ProductoresListPage } from './pages/ProductoresListPage';

// Components
export { CreateProductorModal } from './components/CreateProductorModal';
export { ProductoresList } from './components/ProductoresList';
export { ProductorFilters } from './components/ProductorFilters';

// Hooks
export { useCreateProductor } from './hooks/useCreateProductor';
export { useProductores } from './hooks/useProductores';
export { useUpdateProductor } from './hooks/useUpdateProductor';
export { useDeleteProductor } from './hooks/useDeleteProductor';
export { useProductorStats } from './hooks/useProductorStats';

// Types
export type {
  Productor,
  CreateProductorInput,
  UpdateProductorInput,
  ProductorFilters,
  CategoriaProductor,
  ProductorStats,
} from './types/productor.types';

// Service
export { productoresService } from './services/productores.service';
