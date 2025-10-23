import { z } from "zod";

/**
 * Schema base para UUID
 * Reutilizable en otros schemas
 */
const UUIDSchema = z.string().uuid({
  message: "Formato UUID inválido",
});

/**
 * Schema para username
 * Reglas APROMAM: 5-50 chars, empieza con letra, solo alfanuméricos y underscore
 */
const UsernameSchema = z
  .string()
  .min(5, "Username debe tener al menos 5 caracteres")
  .max(50, "Username no puede exceder 50 caracteres")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Username debe empezar con letra y contener solo letras, números y guión bajo"
  );

/**
 * Schema para email
 */
const EmailSchema = z
  .string()
  .email("Formato de email inválido")
  .toLowerCase()
  .trim();

/**
 * Schema para password
 * Límite máximo 72 chars por restricción bcrypt
 * Validación de fortaleza en utils/hash.utils.ts
 */
const PasswordSchema = z
  .string()
  .min(8, "Password debe tener al menos 8 caracteres")
  .max(72, "Password no puede exceder 72 caracteres (límite bcrypt)");

/**
 * Schema para password con validación de fortaleza
 * Usado en registro
 */
const StrongPasswordSchema = PasswordSchema.refine(
  (pwd) => /[A-Z]/.test(pwd),
  "Password debe contener al menos una mayúscula"
)
  .refine(
    (pwd) => /[a-z]/.test(pwd),
    "Password debe contener al menos una minúscula"
  )
  .refine(
    (pwd) => /[0-9]/.test(pwd),
    "Password debe contener al menos un número"
  );

/**
 * Schema para nombre completo
 */
const NombreCompletoSchema = z
  .string()
  .min(3, "Nombre completo debe tener al menos 3 caracteres")
  .max(200, "Nombre completo no puede exceder 200 caracteres")
  .trim();

/**
 * Schema para rol (uno de los 4 del sistema)
 */
const RolNombreSchema = z.enum(
  ["administrador", "gerente", "tecnico", "invitado"],
  {
    errorMap: () => ({
      message:
        "Rol debe ser: administrador, gerente, tecnico o invitado",
    }),
  }
);

// ==========================================
// SCHEMAS DE REQUEST
// ==========================================

/**
 * Schema para login
 * Validación mínima - no revelar info sobre formato requerido
 */
export const LoginSchema = z.object({
  username: z.string().min(1, "Username es requerido"),
  password: z.string().min(1, "Password es requerido"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Schema para registro de usuario
 * Incluye validación cross-field para técnicos
 */
export const RegisterSchema = z
  .object({
    username: UsernameSchema,
    email: EmailSchema,
    password: StrongPasswordSchema,
    nombre_completo: NombreCompletoSchema,
    id_rol: UUIDSchema,
    id_comunidad: UUIDSchema.nullish(),
  })
  .refine(
    (data) => {
      // Si no hay id_comunidad, permitir (se validará en service con rol)
      return true;
    },
    {
      message: "Datos de registro incompletos",
    }
  );

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Schema para refresh token
 */
export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token es requerido"),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

/**
 * Schema para cambio de password
 */
export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Password actual es requerido"),
    new_password: StrongPasswordSchema,
    confirm_password: z.string().min(1, "Confirmación es requerida"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Los passwords no coinciden",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "El nuevo password debe ser diferente al actual",
    path: ["new_password"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/**
 * Schema para solicitud de password reset
 */
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

/**
 * Schema para reset de password con token
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token es requerido"),
    new_password: StrongPasswordSchema,
    confirm_password: z.string().min(1, "Confirmación es requerida"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Los passwords no coinciden",
    path: ["confirm_password"],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ==========================================
// SCHEMAS DE RESPONSE
// ==========================================

/**
 * Schema para respuesta de usuario público
 * Sin password_hash ni datos sensibles
 */
export const UserPublicSchema = z.object({
  id_usuario: UUIDSchema,
  username: z.string(),
  email: EmailSchema,
  nombre_completo: z.string(),
  nombre_rol: z.string(),
  nombre_comunidad: z.string().optional(),
  activo: z.boolean(),
  last_login: z.string().datetime().optional(),
});

export type UserPublicData = z.infer<typeof UserPublicSchema>;

/**
 * Schema para respuesta de tokens
 */
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

/**
 * Schema para respuesta de login exitoso
 */
export const LoginResponseSchema = z.object({
  user: UserPublicSchema,
  tokens: TokenResponseSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * Schema para respuesta de registro exitoso
 */
export const RegisterResponseSchema = z.object({
  user: UserPublicSchema,
  tokens: TokenResponseSchema,
  message: z.string().optional(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/**
 * Schema para respuesta de /me
 */
export const MeResponseSchema = z.object({
  user: UserPublicSchema,
  permisos: z.record(z.string(), z.any()),
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

/**
 * Schema para respuesta de logout
 */
export const LogoutResponseSchema = z.object({
  message: z.string(),
  logged_out_at: z.string().datetime(),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

/**
 * Schema para respuesta de refresh token
 */
export const RefreshResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive(),
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// ==========================================
// SCHEMAS DE ERROR
// ==========================================

/**
 * Schema para errores de validación
 */
export const ValidationErrorSchema = z.object({
  error: z.literal("validation_error"),
  message: z.string(),
  details: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    })
  ),
});

/**
 * Schema para errores de autenticación
 */
export const AuthErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
});

// ==========================================
// VALIDADORES HELPER
// ==========================================

/**
 * Valida que un rol requiera comunidad (técnico)
 * Usado en business logic validation
 */
export function rolRequiereComunidad(rolNombre: string): boolean {
  return rolNombre.toLowerCase() === "tecnico";
}

/**
 * Valida formato de token JWT
 * Útil para validación rápida antes de verificar
 */
export function isValidJWTFormat(token: string): boolean {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  return jwtRegex.test(token);
}

/**
 * Valida que username no sea keyword reservada
 */
export function isReservedUsername(username: string): boolean {
  const reserved = [
    "admin",
    "root",
    "system",
    "administrator",
    "apromam",
    "api",
    "auth",
    "test",
  ];
  return reserved.includes(username.toLowerCase());
}

/**
 * Schema extendido de registro con validación de username reservado
 */
export const RegisterSchemaStrict = RegisterSchema.refine(
  (data) => !isReservedUsername(data.username),
  {
    message: "Username no disponible (palabra reservada)",
    path: ["username"],
  }
);
