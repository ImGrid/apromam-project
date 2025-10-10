export interface DashboardStats {
  totalUsuarios: number;
  totalComunidades: number;
  totalProductores: number;
  totalFichas: number;
  fichasPendientes: number;
  fichasEnRevision: number;
  fichasAprobadas: number;
  parcelasSinGPS: number;
}

export interface DashboardAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  action?: {
    label: string;
    path: string;
  };
}
