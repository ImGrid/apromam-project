// src/app/routes.tsx (ACTUALIZAR - router con dashboards por rol)
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute";
import { ROUTES } from "@/shared/config/routes.config";

// Pages
import { LoginPage } from "@/pages/Login.page";
import { DashboardRouter } from "@/pages/DashboardRouter.page";
import { NotFoundPage } from "@/pages/NotFound.page";
import { UnauthorizedPage } from "@/pages/Unauthorized.page";

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
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
