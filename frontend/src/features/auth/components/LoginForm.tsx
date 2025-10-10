import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ROUTES } from "@/shared/config/routes.config";
import { useLogin } from "../hooks/useLogin";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const { login, isLoading, error } = useLogin();

  // Estados del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Errores de validacion local
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Validacion en tiempo real del campo username
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return "El usuario es requerido";
    }
    if (value.length < 3) {
      return "El usuario debe tener al menos 3 caracteres";
    }
    return undefined;
  };

  // Validacion en tiempo real del campo password
  const validatePassword = (value: string) => {
    if (!value) {
      return "La contraseña es requerida";
    }
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    return undefined;
  };

  // Maneja cambio en username con validacion instantanea
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Validar solo si el usuario ya escribio algo
    if (value.length > 0) {
      const error = validateUsername(value);
      setFieldErrors((prev) => ({ ...prev, username: error }));
    } else {
      setFieldErrors((prev) => ({ ...prev, username: undefined }));
    }
  };

  // Maneja cambio en password con validacion instantanea
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    // Validar solo si el usuario ya escribio algo
    if (value.length > 0) {
      const error = validatePassword(value);
      setFieldErrors((prev) => ({ ...prev, password: error }));
    } else {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  // Toggle mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Maneja el submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setFieldErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    // Limpiar errores de campo
    setFieldErrors({});

    try {
      // Llamar al hook de login
      await login({ username, password });

      // Callback de exito si existe
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir al dashboard por defecto
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err) {
      // El error ya se maneja en el hook useLogin
      console.error("Error en login:", err);
    }
  };

  // Verificar si el formulario es valido
  const isFormValid =
    username.trim().length >= 3 &&
    password.length >= 6 &&
    !fieldErrors.username &&
    !fieldErrors.password;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error general del servidor */}
      {error && (
        <div className="p-4 text-sm border rounded-lg bg-error/10 border-error/20 text-error">
          <div className="flex items-start gap-2">
            <svg
              className="flex-shrink-0 w-5 h-5 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Campo Usuario */}
      <Input
        label="Usuario"
        inputType="text"
        placeholder="Ingrese su usuario"
        value={username}
        onChange={handleUsernameChange}
        error={fieldErrors.username}
        disabled={isLoading}
        required
        autoComplete="username"
        autoFocus
      />

      {/* Campo Contraseña con toggle show/hide */}
      <div className="relative">
        <Input
          label="Contraseña"
          inputType={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          error={fieldErrors.password}
          disabled={isLoading}
          required
          autoComplete="current-password"
        />

        {/* Boton para mostrar/ocultar contraseña */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-[42px] flex items-center justify-center w-10 h-10 text-text-secondary hover:text-primary transition-colors touch-target"
          disabled={isLoading}
          aria-label={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
        >
          {showPassword ? (
            // Icono ojo cerrado
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                clipRule="evenodd"
              />
              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
            </svg>
          ) : (
            // Icono ojo abierto
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path
                fillRule="evenodd"
                d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Recordar sesion */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer touch-target">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 border rounded cursor-pointer text-primary border-neutral-border focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
          />
          <span className="text-sm select-none text-text-secondary">
            Recordar sesión
          </span>
        </label>

        {/* Link olvide contraseña */}
        <button
          type="button"
          disabled={isLoading}
          className="text-sm transition-colors touch-target text-primary hover:text-primary-dark disabled:opacity-50"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Boton de login */}
      <Button
        type="submit"
        variant="primary"
        size="medium"
        fullWidth
        isLoading={isLoading}
        disabled={!isFormValid || isLoading}
      >
        {isLoading ? "Iniciando sesión..." : "Ingresar"}
      </Button>

      {/* Texto informativo sobre remember me */}
      {rememberMe && (
        <p className="text-xs text-center text-text-secondary">
          Tu sesión se mantendrá activa en este dispositivo
        </p>
      )}
    </form>
  );
}
