import apiClient from "@/shared/services/api/apiClient";
import { ENDPOINTS } from "@/shared/services/api/endpoints";

class ReportesService {
  async descargarReporteProductores(): Promise<void> {
    try {
      const response = await apiClient.get(
        ENDPOINTS.REPORTES.PRODUCTORES_ORGANICOS,
        {
          responseType: "blob",
        }
      );

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Nombre del archivo (puede venir del header Content-Disposition)
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "Reporte_Productores.xlsx";

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }
}

export const reportesService = new ReportesService();
