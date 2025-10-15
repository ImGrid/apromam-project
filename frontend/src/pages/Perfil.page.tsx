/**
 * Página de perfil del usuario
 * Muestra información personal y datos de la cuenta
 */

import { User, Mail, Shield, Building2, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { AdminLayout } from "@/shared/components/layout/AdminLayout";
import { TecnicoLayout } from "@/shared/components/layout/TecnicoLayout";
import { GerenteLayout } from "@/shared/components/layout/GerenteLayout";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button, Badge, Alert } from "@/shared/components/ui";

export function PerfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isGerente, isTecnico } = usePermissions();

  // Seleccionar layout según rol
  const Layout = isAdmin()
    ? AdminLayout
    : isGerente()
    ? GerenteLayout
    : isTecnico()
    ? TecnicoLayout
    : AdminLayout; // Default

  if (!user) {
    return (
      <Layout title="Mi Perfil">
        <PageContainer title="Mi Perfil">
          <div className="flex items-center justify-center h-64">
            <p className="text-text-secondary">Cargando perfil...</p>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  // Iniciales del usuario para el avatar
  const initials = user.nombre_completo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Formatear fechas
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mapeo de roles a variantes de Badge
  const getRoleBadgeVariant = (rol: string): "success" | "info" | "warning" | "neutral" => {
    const roleLower = rol.toLowerCase();
    if (roleLower === "administrador") return "warning";
    if (roleLower === "gerente") return "info";
    if (roleLower === "tecnico") return "success";
    return "neutral";
  };

  return (
    <Layout title="Mi Perfil">
      <PageContainer
        title="Mi Perfil"
        description="Información de tu cuenta y configuración personal"
        actions={
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Columna izquierda - Info principal */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-white border rounded-lg border-neutral-border">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-24 h-24 mb-4 text-3xl font-bold text-white rounded-full bg-primary">
                    {initials}
                  </div>

                  {/* Nombre */}
                  <h2 className="mb-1 text-2xl font-bold text-text-primary">
                    {user.nombre_completo}
                  </h2>

                  {/* Username */}
                  <p className="mb-3 text-sm text-text-secondary">@{user.username}</p>

                  {/* Badge de rol */}
                  <div className="mb-4">
                    <Badge variant={getRoleBadgeVariant(user.nombre_rol)}>
                      {user.nombre_rol}
                    </Badge>
                  </div>

                  {/* Estado */}
                  <Badge variant={user.activo ? "success" : "error"}>
                    {user.activo ? "Cuenta Activa" : "Cuenta Inactiva"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Columna derecha - Detalles */}
            <div className="space-y-6 lg:col-span-2">
              {/* Información Personal */}
              <div className="p-6 bg-white border rounded-lg border-neutral-border">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">
                  Información Personal
                </h3>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-secondary">Email</p>
                      <p className="mt-1 text-base text-text-primary">{user.email}</p>
                    </div>
                  </div>

                  {/* Nombre completo */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-secondary">Nombre Completo</p>
                      <p className="mt-1 text-base text-text-primary">{user.nombre_completo}</p>
                    </div>
                  </div>

                  {/* Comunidad (si aplica) */}
                  {user.nombre_comunidad && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-success/10">
                        <Building2 className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-secondary">Comunidad Asignada</p>
                        <p className="mt-1 text-base text-text-primary">{user.nombre_comunidad}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Cuenta */}
              <div className="p-6 bg-white border rounded-lg border-neutral-border">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">
                  Información de la Cuenta
                </h3>

                <div className="space-y-4">
                  {/* Rol */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-info/10">
                      <Shield className="w-5 h-5 text-info" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-secondary">Rol en el Sistema</p>
                      <p className="mt-1 text-base text-text-primary">{user.nombre_rol}</p>
                    </div>
                  </div>

                  {/* Fecha de creación */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-neutral-bg">
                      <Calendar className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-secondary">Cuenta Creada</p>
                      <p className="mt-1 text-base text-text-primary">{formatDate(user.created_at)}</p>
                    </div>
                  </div>

                  {/* Último inicio de sesión */}
                  {user.last_login && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-neutral-bg">
                        <Calendar className="w-5 h-5 text-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-secondary">Último Inicio de Sesión</p>
                        <p className="mt-1 text-base text-text-primary">{formatDate(user.last_login)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <Alert
            type="info"
            message={
              <>
                <strong>Nota:</strong> Para actualizar tu información personal o cambiar tu contraseña,
                por favor contacta con el administrador del sistema.
              </>
            }
          />
        </div>
      </PageContainer>
    </Layout>
  );
}
