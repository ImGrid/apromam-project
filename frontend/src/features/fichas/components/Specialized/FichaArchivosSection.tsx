/**
 * FichaArchivosSection
 * Sección para gestionar archivos adjuntos de una ficha
 * Permite subir y visualizar croquis, fotos de parcelas y documentos PDF
 */

import { useState, useEffect } from "react";
import {
  FileImage,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Alert";
import { FileUploadZone, type FileType } from "./FileUploadZone";
import { useUploadArchivo } from "../../hooks/useUploadArchivo";
import { fichasService } from "../../services/fichas.service";
import type { ArchivoFicha } from "../../types/ficha.types";

interface FichaArchivosSectionProps {
  idFicha: string;
  archivos?: ArchivoFicha[];
  canEdit?: boolean;
  onArchivosChange?: () => void;
}

export function FichaArchivosSection({
  idFicha,
  archivos: initialArchivos = [],
  canEdit = false,
  onArchivosChange,
}: FichaArchivosSectionProps) {
  const [archivos, setArchivos] = useState<ArchivoFicha[]>(initialArchivos);
  const [isLoading, setIsLoading] = useState(false);
  const { uploadArchivo, deleteArchivo, isLoading: isUploading } =
    useUploadArchivo();

  useEffect(() => {
    setArchivos(initialArchivos);
  }, [initialArchivos]);

  // Cargar archivos desde el servidor
  const loadArchivos = async () => {
    try {
      setIsLoading(true);
      const data = await fichasService.getArchivos(idFicha);
      setArchivos(data);
      onArchivosChange?.();
    } catch (err) {
      // Error al cargar archivos
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para subir archivo
  const handleUpload = async (file: File, tipoArchivo: FileType) => {
    try {
      await uploadArchivo(idFicha, file, tipoArchivo);
      await loadArchivos();
    } catch (err) {
      // El error ya se muestra en el hook
    }
  };

  // Handler para eliminar archivo
  const handleDelete = async (idArchivo: string) => {
    if (
      !window.confirm("¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.")
    ) {
      return;
    }

    try {
      await deleteArchivo(idFicha, idArchivo);
      setArchivos((prev) => prev.filter((a) => a.id_archivo !== idArchivo));
      onArchivosChange?.();
    } catch (err) {
      // El error ya se muestra en el hook
    }
  };

  // Handler para descargar archivo
  const handleDownload = async (idArchivo: string, nombreOriginal: string) => {
    try {
      const url = fichasService.getArchivoUrl(idFicha, idArchivo);

      // Obtener el token de autenticación desde localStorage
      const token = localStorage.getItem("apromam_access_token");
      if (!token) {
        alert("No hay token de autenticación. Por favor, vuelva a iniciar sesión.");
        return;
      }

      // Descargar el archivo con autenticación
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`);
      }

      // Convertir a blob y descargar
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = nombreOriginal;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      alert("Error al descargar el archivo");
    }
  };

  // Agrupar archivos por tipo
  const archivosPorTipo: Record<FileType, ArchivoFicha[]> = {
    croquis: archivos.filter((a) => a.tipo_archivo === "croquis"),
    foto_parcela: archivos.filter((a) => a.tipo_archivo === "foto_parcela"),
    documento_pdf: archivos.filter((a) => a.tipo_archivo === "documento_pdf"),
  };

  const getIconForType = (tipo: string) => {
    if (tipo === "croquis" || tipo === "foto_parcela") {
      return <FileImage className="w-5 h-5 text-primary" />;
    }
    return <FileText className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-4">
      {/* Información */}
      <Alert
        type="info"
        message={
          <p className="text-sm">
            {canEdit
              ? "Puedes adjuntar croquis, fotos de parcelas y documentos PDF relacionados con la inspección."
              : "Archivos adjuntos a esta ficha de inspección."}
          </p>
        }
      />

      {/* Grid de 3 columnas para las secciones */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sección de Croquis */}
        <div className="p-4 border rounded-lg border-neutral-border">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Croquis de la Unidad Productiva
          </h4>
          {canEdit && (
            <div className="mb-4">
              <FileUploadZone
                onUpload={(file) => handleUpload(file, "croquis")}
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                maxSize={5}
                tipoArchivo="croquis"
                disabled={isUploading}
              />
            </div>
          )}
          {archivosPorTipo.croquis.length > 0 ? (
            <div className="space-y-2">
              {archivosPorTipo.croquis.map((archivo) => (
                <ArchivoItem
                  key={archivo.id_archivo}
                  archivo={archivo}
                  onDownload={handleDownload}
                  onDelete={canEdit ? handleDelete : undefined}
                  icon={getIconForType(archivo.tipo_archivo)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              No hay croquis adjuntos
            </p>
          )}
        </div>

        {/* Sección de Fotos de Parcelas */}
        <div className="p-4 border rounded-lg border-neutral-border">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Fotos de Parcelas
          </h4>
          {canEdit && (
            <div className="mb-4">
              <FileUploadZone
                onUpload={(file) => handleUpload(file, "foto_parcela")}
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                maxSize={5}
                tipoArchivo="foto_parcela"
                disabled={isUploading}
                multiple
              />
            </div>
          )}
          {archivosPorTipo.foto_parcela.length > 0 ? (
            <div className="space-y-2">
              {archivosPorTipo.foto_parcela.map((archivo) => (
                <ArchivoItem
                  key={archivo.id_archivo}
                  archivo={archivo}
                  onDownload={handleDownload}
                  onDelete={canEdit ? handleDelete : undefined}
                  icon={getIconForType(archivo.tipo_archivo)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              No hay fotos adjuntas
            </p>
          )}
        </div>

        {/* Sección de Documentos PDF */}
        <div className="p-4 border rounded-lg border-neutral-border">
          <h4 className="mb-3 text-sm font-semibold text-text-primary">
            Documentos PDF
          </h4>
          {canEdit && (
            <div className="mb-4">
              <FileUploadZone
                onUpload={(file) => handleUpload(file, "documento_pdf")}
                accept=".pdf,application/pdf"
                maxSize={10}
                tipoArchivo="documento_pdf"
                disabled={isUploading}
                multiple
              />
            </div>
          )}
          {archivosPorTipo.documento_pdf.length > 0 ? (
            <div className="space-y-2">
              {archivosPorTipo.documento_pdf.map((archivo) => (
                <ArchivoItem
                  key={archivo.id_archivo}
                  archivo={archivo}
                  onDownload={handleDownload}
                  onDelete={canEdit ? handleDelete : undefined}
                  icon={getIconForType(archivo.tipo_archivo)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              No hay documentos PDF adjuntos
            </p>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 text-center">
          <p className="text-sm text-text-secondary">Cargando archivos...</p>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar un archivo individual
interface ArchivoItemProps {
  archivo: ArchivoFicha;
  onDownload: (idArchivo: string, nombreOriginal: string) => void;
  onDelete?: (idArchivo: string) => void;
  icon: React.ReactNode;
}

function ArchivoItem({
  archivo,
  onDownload,
  onDelete,
  icon,
}: ArchivoItemProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-bg">
      <div className="flex items-center flex-1 gap-3 min-w-0">
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-text-primary">
            {archivo.nombre_original}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span>{formatFileSize(archivo.tamaño_bytes)}</span>
            {archivo.fecha_captura && (
              <>
                <span>•</span>
                <span>{new Date(archivo.fecha_captura).toLocaleDateString()}</span>
              </>
            )}
            {archivo.estado_upload && (
              <>
                <span>•</span>
                <span
                  className={
                    archivo.estado_upload === "completado"
                      ? "text-success"
                      : archivo.estado_upload === "error"
                      ? "text-error"
                      : ""
                  }
                >
                  {archivo.estado_upload}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          onClick={() => onDownload(archivo.id_archivo, archivo.nombre_original)}
          title="Descargar archivo"
        >
          <Download className="w-4 h-4" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            onClick={() => onDelete(archivo.id_archivo)}
            title="Eliminar archivo"
          >
            <Trash2 className="w-4 h-4 text-error" />
          </Button>
        )}
      </div>
    </div>
  );
}
