/**
 * Login Page - Actualizada con componentes de Fase 1.4
 * Usa: AuthLayout, Button, Input
 * Por ahora es placeholder - se hará funcional en Fase 2
 */

import { AuthLayout } from "@/shared/components/layout/AuthLayout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export function LoginPage() {
  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Sistema de Certificación Orgánica"
    >
      {/* Formulario de login - placeholder para Fase 2 */}
      <form className="space-y-5">
        {/* Campo Usuario */}
        <Input
          label="Usuario"
          inputType="text"
          placeholder="Ingrese su usuario"
          required
          disabled
        />

        {/* Campo Contraseña */}
        <Input
          label="Contraseña"
          inputType="password"
          placeholder="••••••••"
          required
          disabled
        />

        {/* Recordar sesión */}
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            disabled
            className="w-4 h-4 border rounded text-primary border-neutral-border focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <label
            htmlFor="remember"
            className="ml-2 text-sm text-text-secondary"
          >
            Recordar sesión
          </label>
        </div>

        {/* Botón de login */}
        <Button
          type="submit"
          variant="primary"
          size="medium"
          fullWidth
          disabled
        >
          Ingresar
        </Button>

        {/* Link olvidé contraseña */}
        <div className="text-center">
          <button
            type="button"
            disabled
            className="text-sm text-primary hover:text-primary-dark disabled:opacity-50"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
