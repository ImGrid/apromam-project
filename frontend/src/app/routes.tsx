import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute";
import { ROUTES } from "@/shared/config/routes.config";

// Pages - Eager loading (críticas, pequeñas o inmediatas)
import { LoginPage } from "@/pages/Login.page";
import { DashboardRouter } from "@/pages/DashboardRouter.page";
import { NotFoundPage } from "@/pages/NotFound.page";
import { UnauthorizedPage } from "@/pages/Unauthorized.page";
import { PerfilPage } from "@/pages/Perfil.page";

// Lazy loaded pages - Features pesadas (code splitting)
// Nota: Convertimos named exports a default exports para lazy()
const UsuariosListPage = lazy(() =>
  import("@/features/usuarios/pages/UsuariosListPage").then((m) => ({
    default: m.UsuariosListPage,
  }))
);
const TecnicosListPage = lazy(() =>
  import("@/features/tecnicos/pages/TecnicosListPage").then((m) => ({
    default: m.default,
  }))
);
const ComunidadesListPage = lazy(() =>
  import("@/features/comunidades/pages/ComunidadesListPage").then((m) => ({
    default: m.ComunidadesListPage,
  }))
);
const GeograficasManagePage = lazy(() =>
  import("@/features/geograficas/pages/GeograficasManagePage").then((m) => ({
    default: m.GeograficasManagePage,
  }))
);
const CatalogosManagePage = lazy(() =>
  import("@/features/catalogos/pages/CatalogosManagePage").then((m) => ({
    default: m.CatalogosManagePage,
  }))
);
const ProductoresListPage = lazy(() =>
  import("@/features/productores/pages/ProductoresListPage").then((m) => ({
    default: m.ProductoresListPage,
  }))
);

// Módulo de Fichas (el más pesado ~250KB)
// Nota: Estos componentes usan export default, por lo que no necesitan .then()
const FichasListPage = lazy(() =>
  import("@/features/fichas/pages/FichasListPage")
);
const FichaCreatePage = lazy(() =>
  import("@/features/fichas/pages/FichaCreatePage")
);
const FichaEditPage = lazy(() =>
  import("@/features/fichas/pages/FichaEditPage")
);
const FichaDetailPage = lazy(() =>
  import("@/features/fichas/pages/FichaDetailPage")
);

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardRouter />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PERFIL,
    element: (
      <ProtectedRoute>
        <PerfilPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USUARIOS,
    element: (
      <ProtectedRoute requiredRole={["administrador", "gerente"]}>
        <UsuariosListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TECNICOS,
    element: (
      <ProtectedRoute requiredRole={["administrador", "gerente"]}>
        <TecnicosListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.COMUNIDADES,
    element: (
      <ProtectedRoute>
        <ComunidadesListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.GEOGRAFICAS,
    element: (
      <ProtectedRoute>
        <GeograficasManagePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CATALOGOS,
    element: (
      <ProtectedRoute requiredRole={["administrador", "gerente"]}>
        <CatalogosManagePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PRODUCTORES,
    element: (
      <ProtectedRoute requiredRole={["administrador", "gerente", "tecnico"]}>
        <ProductoresListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FICHAS,
    element: (
      <ProtectedRoute>
        <FichasListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FICHAS_CREATE,
    element: (
      <ProtectedRoute requiredRole={["gerente", "tecnico"]}>
        <FichaCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FICHAS_EDIT(":id"),
    element: (
      <ProtectedRoute requiredRole={["gerente", "tecnico"]}>
        <FichaEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FICHAS_DETAIL(":id"),
    element: (
      <ProtectedRoute>
        <FichaDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
