/**
 * Not Found Page
 * Página 404 para rutas inexistentes
 * Diseño con estilos APROMAM
 */

import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes.config";
import { Button } from "@/shared/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
      <div className="px-6 text-center">
        {/* Código de error */}
        <div className="mb-6">
          <h1 className="font-bold text-9xl text-primary">404</h1>
        </div>

        {/* Mensaje principal */}
        <h2 className="mb-4 text-3xl font-semibold text-text-primary">
          Página no encontrada
        </h2>

        {/* Descripción */}
        <p className="max-w-md mx-auto mb-8 text-lg text-text-secondary">
          La ruta que buscas no existe en el sistema. Verifica la URL o regresa
          al dashboard.
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
              Iniciar Sesión
            </Button>
          </Link>
        </div>

        {/* Imagen decorativa opcional */}
        <div className="mt-12">
          <svg
            className="w-64 h-64 mx-auto text-primary opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
