/**
 * Router que selecciona dashboard segun rol
 */

import { usePermissions } from "@/shared/hooks/usePermissions";
import { AdminDashboard } from "@/features/dashboard/pages/AdminDashboard";
import { GerenteDashboard } from "@/features/dashboard/pages/GerenteDashboard";
import { TecnicoDashboard } from "@/features/dashboard/pages/TecnicoDashboard";

export function DashboardRouter() {
  const { isAdmin, isGerente, isTecnico } = usePermissions();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isGerente()) {
    return <GerenteDashboard />;
  }

  if (isTecnico()) {
    return <TecnicoDashboard />;
  }

  // Fallback para otros roles
  return <AdminDashboard />;
}
