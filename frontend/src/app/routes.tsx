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
const ConfiguracionPage = lazy(() =>
  import("@/features/configuracion/pages/ConfiguracionPage").then((m) => ({
    default: m.ConfiguracionPage,
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

// Módulo de No Conformidades (Seguimiento)
const NoConformidadesListPage = lazy(() =>
  import(
    "@/features/seguimiento-no-conformidades/pages/NoConformidadesListPage"
  ).then((m) => ({ default: m.NoConformidadesListPage }))
);
const NoConformidadDetailPage = lazy(() =>
  import(
    "@/features/seguimiento-no-conformidades/pages/NoConformidadDetailPage"
  ).then((m) => ({ default: m.NoConformidadDetailPage }))
);

// Módulo de Reportes
const ReportesPage = lazy(() =>
  import("@/features/reportes/pages/ReportesPage")
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
    path: ROUTES.CONFIGURACION,
    element: (
      <ProtectedRoute requiredRole={["administrador"]}>
        <ConfiguracionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REPORTES,
    element: (
      <ProtectedRoute requiredRole={["administrador", "gerente"]}>
        <ReportesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USUARIOS,
    element: (
      <ProtectedRoute requiredRole={["administrador"]}>
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
      <ProtectedRoute requiredRole={["tecnico", "administrador"]}>
        <FichaCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FICHAS_EDIT(":id"),
    element: (
      <ProtectedRoute requiredRole={["tecnico", "administrador"]}>
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
    path: ROUTES.NO_CONFORMIDADES,
    element: (
      <ProtectedRoute requiredRole={["tecnico", "gerente", "administrador"]}>
        <NoConformidadesListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.NO_CONFORMIDADES_DETAIL(":id"),
    element: (
      <ProtectedRoute requiredRole={["tecnico", "gerente", "administrador"]}>
        <NoConformidadDetailPage />
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
