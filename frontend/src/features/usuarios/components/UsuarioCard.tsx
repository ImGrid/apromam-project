import { Mail, Shield, MapPin, Calendar, Clock } from "lucide-react";
import { Card, Badge, Button } from "@/shared/components/ui";
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
    <Card>
      <div className="space-y-6">
        {/* Header con avatar */}
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 text-xl font-bold text-white rounded-full bg-primary">
            {usuario.nombre_completo
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-text-primary">
              {usuario.nombre_completo}
            </h3>
            <p className="text-sm text-text-secondary">@{usuario.username}</p>

            <div className="flex items-center gap-2 mt-2">
              <Badge variant={usuario.activo ? "success" : "error"}>
                {usuario.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informacion del usuario */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm font-medium text-text-primary">
                {usuario.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Rol</p>
              <p className="text-sm font-medium text-text-primary">
                {usuario.nombre_rol}
              </p>
            </div>
          </div>

          {usuario.nombre_comunidad && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Comunidad</p>
                <p className="text-sm font-medium text-text-primary">
                  {usuario.nombre_comunidad}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Registrado</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(usuario.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {usuario.last_login && (
            <div className="flex items-center gap-3 sm:col-span-2">
              <Clock className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Último acceso</p>
                <p className="text-sm font-medium text-text-primary">
                  {new Date(usuario.last_login).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        {(canEdit || canDelete) && (
          <div className="flex gap-3 pt-4 border-t border-neutral-border">
            {canEdit && (
              <Button variant="primary" onClick={onEdit} fullWidth>
                Editar Usuario
              </Button>
            )}

            {canDelete && usuario.activo && (
              <Button variant="danger" onClick={onDeactivate} fullWidth>
                Desactivar
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
