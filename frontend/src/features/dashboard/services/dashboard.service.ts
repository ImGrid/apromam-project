/**
 * Servicio para obtener datos del dashboard
 */

import { apiClient, ENDPOINTS } from "@/shared/services/api";
import type { DashboardStats, DashboardAlert } from "../types/dashboard.types";

export const dashboardService = {
  /**
   * Obtiene estadisticas generales para admin
   */
  async getAdminStats(): Promise<DashboardStats> {
    try {
      const [usuarios, comunidades, productores, fichas] = await Promise.all([
        apiClient.get(ENDPOINTS.USUARIOS.BASE),
        apiClient.get(ENDPOINTS.COMUNIDADES.BASE),
        apiClient.get(ENDPOINTS.PRODUCTORES.ESTADISTICAS),
        apiClient.get(ENDPOINTS.FICHAS.ESTADISTICAS),
      ]);

      return {
        totalUsuarios: usuarios.data.total || 0,
        totalComunidades: comunidades.data.total || 0,
        totalProductores: productores.data.total || 0,
        totalFichas: fichas.data.total || 0,
        fichasPendientes: fichas.data.por_estado?.borrador || 0,
        fichasEnRevision: fichas.data.por_estado?.revision || 0,
        fichasAprobadas: fichas.data.por_estado?.aprobado || 0,
        parcelasSinGPS: 0, // TODO: implementar endpoint
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  /**
   * Obtiene estadisticas para gerente (sin acceso a usuarios del sistema)
   */
  async getGerenteStats(): Promise<DashboardStats> {
    try {
      const [comunidades, productores, fichas] = await Promise.all([
        apiClient.get(ENDPOINTS.COMUNIDADES.BASE),
        apiClient.get(ENDPOINTS.PRODUCTORES.ESTADISTICAS),
        apiClient.get(ENDPOINTS.FICHAS.ESTADISTICAS),
      ]);

      return {
        totalUsuarios: 0, // Gerente no tiene acceso a lista de usuarios
        totalComunidades: comunidades.data.total || 0,
        totalProductores: productores.data.total || 0,
        totalFichas: fichas.data.total || 0,
        fichasPendientes: fichas.data.por_estado?.borrador || 0,
        fichasEnRevision: fichas.data.por_estado?.revision || 0,
        fichasAprobadas: fichas.data.por_estado?.aprobado || 0,
        parcelasSinGPS: 0, // TODO: implementar endpoint
      };
    } catch (error) {
      console.error("Error fetching gerente stats:", error);
      throw error;
    }
  },

  /**
   * Obtiene alertas importantes
   */
  async getAlertas(): Promise<DashboardAlert[]> {
    try {
      const alertas: DashboardAlert[] = [];

      // Verificar comunidades sin tecnicos
      const comunidadesSinTecnicos = await apiClient.get(
        ENDPOINTS.COMUNIDADES.SIN_TECNICOS
      );

      if (comunidadesSinTecnicos.data.total > 0) {
        alertas.push({
          id: "comunidades-sin-tecnicos",
          type: "warning",
          message: `${comunidadesSinTecnicos.data.total} comunidades sin técnicos asignados`,
          action: {
            label: "Ver comunidades",
            path: "/geograficas",
          },
        });
      }

      // Verificar parcelas sin coordenadas
      const parcelasSinGPS = await apiClient.get(
        "/api/parcelas/sin-coordenadas"
      );

      if (parcelasSinGPS.data.total > 0) {
        alertas.push({
          id: "parcelas-sin-gps",
          type: "info",
          message: `${parcelasSinGPS.data.total} parcelas sin coordenadas GPS`,
          action: {
            label: "Ver parcelas",
            path: "/parcelas",
          },
        });
      }

      // Verificar fichas pendientes revision
      const fichasStats = await apiClient.get(ENDPOINTS.FICHAS.ESTADISTICAS);
      const enRevision = fichasStats.data.por_estado?.revision || 0;

      if (enRevision > 0) {
        alertas.push({
          id: "fichas-revision",
          type: "warning",
          message: `${enRevision} fichas esperando revisión`,
          action: {
            label: "Ver fichas",
            path: "/fichas?estado=revision",
          },
        });
      }

      return alertas;
    } catch (error) {
      console.error("Error fetching alertas:", error);
      return [];
    }
  },
};
