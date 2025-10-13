import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute";
import { ROUTES } from "@/shared/config/routes.config";

// Pages
import { LoginPage } from "@/pages/Login.page";
import { DashboardRouter } from "@/pages/DashboardRouter.page";
import { NotFoundPage } from "@/pages/NotFound.page";
import { UnauthorizedPage } from "@/pages/Unauthorized.page";
import { PerfilPage } from "@/pages/Perfil.page";
import { UsuariosListPage } from "@/features/usuarios";
import { ComunidadesListPage } from "@/features/comunidades/pages/ComunidadesListPage";
import { GeograficasManagePage } from "@/features/geograficas/pages/GeograficasManagePage";
import { CatalogosManagePage } from "@/features/catalogos/pages/CatalogosManagePage";
import { ProductoresListPage } from "@/features/productores";

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
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
