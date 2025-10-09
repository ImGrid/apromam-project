/**
 * Configuración de rutas de la aplicación
 * Define rutas públicas y protegidas con React Router
 */

import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute";
import { ROUTES } from "@/shared/config/routes.config";

// Páginas
import { LoginPage } from "@/pages/Login.page";
import { NotFoundPage } from "@/pages/NotFound.page";
import { UnauthorizedPage } from "@/pages/Unauthorized.page";

/**
 * Configuración del router principal
 * Rutas públicas: login, unauthorized, 404
 * Rutas protegidas: requieren autenticación
 */
export const router = createBrowserRouter([
  // Ruta raíz - redirige a login por defecto
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },

  // Rutas públicas de autenticación
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },

  // Ruta de acceso denegado
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-primary">
              Dashboard APROMAM
            </h1>
            <p className="text-text-secondary">
              Panel principal - En desarrollo
            </p>
          </div>
        </div>
      </ProtectedRoute>
    ),
  },

  // Ruta 404 - debe ser la última
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
