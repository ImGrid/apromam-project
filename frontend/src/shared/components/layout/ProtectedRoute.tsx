/**
 * Protected Route Component
 * Verifica autenticacion antes de mostrar una ruta
 */

import { Navigate } from "react-router-dom";
// Update the import path below if your useAuth hook is located elsewhere
import { useAuth } from "../../hooks/useAuth";
// If the file does not exist, create 'src/hooks/useAuth.ts' or adjust the path accordingly
import { ROUTES } from "../../config/routes.config";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
