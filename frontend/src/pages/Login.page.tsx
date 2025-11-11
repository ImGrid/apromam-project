import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/shared/components/layout/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { ROUTES } from "@/shared/config/routes.config";

// Pagina de Login
// Usa AuthLayout para el diseño y LoginForm para el formulario
export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Si el usuario ya esta autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Callback que se ejecuta cuando el login es exitoso
  const handleLoginSuccess = () => {
    // El redirect se maneja automaticamente por el useEffect de arriba
    // o directamente en LoginForm
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Sistema de Certificación Orgánica"
    >
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
}
