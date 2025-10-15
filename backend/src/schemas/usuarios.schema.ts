import { z } from "zod/v4";

// Schema base para UUID
const UUIDSchema = z.string().uuid({
  message: "Formato UUID invalido",
});

// Schema para username
const UsernameSchema = z
  .string()
  .min(5, "Username debe tener al menos 5 caracteres")
  .max(50, "Username no puede exceder 50 caracteres")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Username debe empezar con letra y contener solo letras, numeros y guion bajo"
  );

// Schema para email
const EmailSchema = z
  .string()
  .email("Formato de email invalido")
  .toLowerCase()
  .trim();

// Schema para password
const PasswordSchema = z
  .string()
  .min(8, "Password debe tener al menos 8 caracteres")
  .max(72, "Password no puede exceder 72 caracteres")
  .refine(
    (pwd) => /[A-Z]/.test(pwd),
    "Password debe contener al menos una mayuscula"
  )
  .refine(
    (pwd) => /[a-z]/.test(pwd),
    "Password debe contener al menos una minuscula"
  )
  .refine(
    (pwd) => /[0-9]/.test(pwd),
    "Password debe contener al menos un numero"
  );

// Schema para crear usuario
// Gerente solo puede crear tecnicos
// Admin puede crear cualquier rol
export const CreateUsuarioSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  nombre_completo: z
    .string()
    .min(3, "Nombre completo debe tener al menos 3 caracteres")
    .max(200, "Nombre completo no puede exceder 200 caracteres")
    .trim(),
  id_rol: UUIDSchema,
  id_comunidad: z
    .union([UUIDSchema, z.null(), z.literal("")])
    .transform((val) => (val === "" || val === null ? undefined : val))
    .optional(),
});

export type CreateUsuarioInput = z.infer<typeof CreateUsuarioSchema>;

// Schema para actualizar usuario
export const UpdateUsuarioSchema = z.object({
  email: EmailSchema.optional(),
  nombre_completo: z
    .string()
    .min(3, "Nombre completo debe tener al menos 3 caracteres")
    .max(200, "Nombre completo no puede exceder 200 caracteres")
    .trim()
    .optional(),
  id_comunidad: z
    .union([UUIDSchema, z.null(), z.literal("")])
    .transform((val) => (val === "" || val === null ? null : val))
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>;

// Schema para parametros de URL
export const UsuarioParamsSchema = z.object({
  id: UUIDSchema,
});

export type UsuarioParams = z.infer<typeof UsuarioParamsSchema>;

// Schema para query params
export const UsuarioQuerySchema = z.object({
  rol: z.string().optional(),
  comunidad: UUIDSchema.optional(),
  activo: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type UsuarioQuery = z.infer<typeof UsuarioQuerySchema>;

// Schema para respuesta usuario
export const UsuarioResponseSchema = z.object({
  id_usuario: UUIDSchema,
  username: z.string(),
  email: z.string(),
  nombre_completo: z.string(),
  nombre_rol: z.string(),
  nombre_comunidad: z.string().optional(),
  activo: z.boolean(),
  last_login: z.string().optional(),
  created_at: z.string(),
});

export type UsuarioResponse = z.infer<typeof UsuarioResponseSchema>;

// Schema para lista de usuarios
export const UsuariosListResponseSchema = z.object({
  usuarios: z.array(UsuarioResponseSchema),
  total: z.number().int(),
});

export type UsuariosListResponse = z.infer<typeof UsuariosListResponseSchema>;

// Schema para errores
export const UsuarioErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

export type UsuarioError = z.infer<typeof UsuarioErrorSchema>;
