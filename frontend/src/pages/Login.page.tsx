/**
 * Login Page
 * Página de inicio de sesión con diseño APROMAM
 * Fase 1: Versión temporal para testing de rutas
 */

export function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
      <div className="w-full px-6 max-width: 400px">
        {/* Card de login */}
        <div className="p-8 bg-white border rounded-lg shadow-md border-neutral-border">
          {/* Logo y título */}
          <div className="mb-8 text-center">
            <div className="mb-4">
              <img
                src="https://apromam.com/wp-content/uploads/2021/01/cropped-LOGO-APROMAM-H-1024x322.png"
                alt="APROMAM"
                className="h-16 mx-auto"
              />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-text-primary">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-text-secondary">
              Sistema de Certificación Orgánica
            </p>
          </div>

          {/* Placeholder para formulario */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Ingrese su usuario"
                disabled
                className="w-full px-4 py-2 border rounded-md cursor-not-allowed border-neutral-border bg-neutral-bg text-text-secondary"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="w-full px-4 py-2 border rounded-md cursor-not-allowed border-neutral-border bg-neutral-bg text-text-secondary"
              />
            </div>

            <button
              disabled
              className="w-full py-3 font-medium text-white rounded-md opacity-50 cursor-not-allowed bg-primary"
            >
              Ingresar
            </button>
          </div>

          {/* Mensaje de desarrollo */}
          <div className="p-4 mt-6 border rounded-md bg-neutral-bg border-neutral-border">
            <p className="text-sm text-center text-text-secondary">
              Formulario de login - En desarrollo
            </p>
            <p className="mt-2 text-xs text-center text-text-secondary">
              Se implementará en Fase 2
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-sm text-center text-text-secondary">
          APROMAM © 2025 - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
