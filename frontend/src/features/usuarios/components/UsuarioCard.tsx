import { Mail, Shield, MapPin, Calendar, Clock } from "lucide-react";
import { Badge, Button } from "@/shared/components/ui";
import type { Usuario } from "../types/usuario.types";

interface UsuarioCardProps {
  usuario: Usuario;
  onEdit?: () => void;
  onDeactivate?: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function UsuarioCard({
  usuario,
  onEdit,
  onDeactivate,
  canEdit,
  canDelete,
}: UsuarioCardProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header con avatar */}
      <div className="flex items-start gap-5">
        <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 text-2xl font-bold text-white rounded-full bg-primary">
          {usuario.nombre_completo
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-semibold text-text-primary">
            {usuario.nombre_completo}
          </h3>
          <p className="mt-1 text-base text-text-secondary">
            @{usuario.username}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant={usuario.activo ? "success" : "error"}>
              {usuario.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Informacion del usuario */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-4">
          <Mail className="flex-shrink-0 w-6 h-6 mt-1 text-text-secondary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-secondary">Email</p>
            <p className="mt-1 text-base font-medium break-all text-text-primary">
              {usuario.email}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Shield className="flex-shrink-0 w-6 h-6 mt-1 text-text-secondary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-secondary">Rol</p>
            <p className="mt-1 text-base font-medium text-text-primary">
              {usuario.nombre_rol}
            </p>
          </div>
        </div>

        {usuario.comunidades && usuario.comunidades.length > 0 && (
          <div className="flex items-start gap-4">
            <MapPin className="flex-shrink-0 w-6 h-6 mt-1 text-text-secondary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">
                {usuario.comunidades.length === 1 ? "Comunidad" : "Comunidades"}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {usuario.comunidades.map((c) => (
                  <span
                    key={c.id_comunidad}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
                  >
                    {c.nombre_comunidad}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <Calendar className="flex-shrink-0 w-6 h-6 mt-1 text-text-secondary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-secondary">
              Registrado
            </p>
            <p className="mt-1 text-base font-medium text-text-primary">
              {new Date(usuario.created_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {usuario.last_login && (
          <div className="flex items-start gap-4 sm:col-span-2">
            <Clock className="flex-shrink-0 w-6 h-6 mt-1 text-text-secondary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-secondary">
                Último acceso
              </p>
              <p className="mt-1 text-base font-medium text-text-primary">
                {new Date(usuario.last_login).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      {(canEdit || canDelete) && (
        <div className="flex gap-4 pt-6">
          {canEdit && (
            <Button
              variant="primary"
              onClick={onEdit}
              fullWidth
              size="medium"
              className="py-3 text-base"
            >
              Editar Usuario
            </Button>
          )}

          {canDelete && usuario.activo && (
            <Button
              variant="danger"
              onClick={onDeactivate}
              fullWidth
              size="medium"
              className="py-3 text-base"
            >
              Desactivar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
