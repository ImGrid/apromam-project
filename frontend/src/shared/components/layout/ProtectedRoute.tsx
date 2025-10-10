import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { ROUTES } from "@/shared/config/routes.config";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

// Componente que protege rutas verificando autenticacion y permisos
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Mostrar loading mientras verifica la autenticacion
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
        <div className="text-center">
          {/* Spinner de carga */}
          <div className="inline-block w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-sm text-text-secondary">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  // Si no esta autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Verificar rol requerido si se especifica
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some((role) => hasRole(role));

    // Si no tiene el rol requerido, redirigir a unauthorized
    if (!hasRequiredRole) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  // Usuario autenticado y con permisos correctos
  return <>{children}</>;
}
