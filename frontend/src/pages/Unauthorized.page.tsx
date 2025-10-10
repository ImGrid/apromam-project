/**
 * Unauthorized Page
 * Página 403 para acceso denegado por permisos
 * Diseño con estilos APROMAM
 */

import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes.config";
import { Button } from "@/shared/components/ui/Button";

export function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
      <div className="px-6 text-center">
        {/* Código de error */}
        <div className="mb-6">
          <h1 className="font-bold text-9xl text-warning">403</h1>
        </div>

        {/* Mensaje principal */}
        <h2 className="mb-4 text-3xl font-semibold text-text-primary">
          Acceso Denegado
        </h2>

        {/* Descripción */}
        <p className="max-w-md mx-auto mb-8 text-lg text-text-secondary">
          No tienes permisos para acceder a este recurso. Contacta al
          administrador si crees que esto es un error.
        </p>

        {/* Acciones */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="primary" size="medium">
              Ir al Dashboard
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" size="medium">
              Cambiar de Usuario
            </Button>
          </Link>
        </div>

        {/* Icono decorativo */}
        <div className="mt-12">
          <svg
            className="w-64 h-64 mx-auto text-warning opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
