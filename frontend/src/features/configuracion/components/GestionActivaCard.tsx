/**
 * GestionActivaCard
 * Card que muestra la gestión activa del sistema
 * Solo visible en la página de configuración (admin)
 */

import { Calendar, Check } from "lucide-react";
import { Card, Badge } from "@/shared/components/ui";
import type { Gestion } from "../types/gestion.types";

interface GestionActivaCardProps {
  gestion: Gestion;
}

export function GestionActivaCard({ gestion }: GestionActivaCardProps) {
  return (
    <Card variant="elevated" compact>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
            <Calendar className="w-5 h-5 text-success" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-text-primary">
                Gestión {gestion.anio_gestion}
              </h3>
              <Badge variant="success" size="small" icon={<Check className="w-3 h-3" />}>
                Activa
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
