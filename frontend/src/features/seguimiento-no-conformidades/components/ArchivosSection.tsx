// Sección de archivos de No Conformidad
// Upload y lista de archivos de evidencia
// Diseño compacto con tabla para archivos

import { useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { useArchivosNC, useUploadArchivoNC, useDeleteArchivoNC } from "../hooks";
import { noConformidadesService } from "../services/noConformidades.service";
import {
  validateFile,
  TIPO_ARCHIVO_LABELS,
  type TipoArchivoNC,
} from "../types";
import { Upload, Download, Trash2, File, FileText, Image } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { logger } from "@/shared/utils/logger";

interface ArchivosSectionProps {
  idNoConformidad: string;
}

export function ArchivosSection({ idNoConformidad }: ArchivosSectionProps) {
  const { data: archivosData, isLoading } = useArchivosNC(idNoConformidad);
  const { mutate: uploadArchivo, isPending: isUploading } = useUploadArchivoNC();
  const { mutate: deleteArchivo } = useDeleteArchivoNC();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoArchivo, setTipoArchivo] = useState<TipoArchivoNC>("evidencia_correccion");
  const [fileError, setFileError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFileError("");
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error || "Archivo inválido");
      setSelectedFile(null);
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadArchivo(
      {
        idNoConformidad,
        file: selectedFile,
        tipoArchivo,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setFileError("");
          // Reset input
          const input = document.getElementById("file-input") as HTMLInputElement;
          if (input) input.value = "";
        },
      }
    );
  };

  const handleDelete = (idArchivo: string) => {
    if (confirm("¿Está seguro de eliminar este archivo?")) {
      deleteArchivo({ idNoConformidad, idArchivo });
    }
  };

  const handleDownload = async (idArchivo: string, nombreArchivo: string) => {
    try {
      const url = noConformidadesService.getDownloadUrl(idNoConformidad, idArchivo);

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
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      logger.error("Error al descargar archivo:", error);
      alert("Error al descargar el archivo");
    }
  };

  const getFileIcon = (mimeType: string | null | undefined) => {
    if (!mimeType) return File;
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.includes("pdf")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section - Compacto */}
      <Card compact title="Subir Archivo">
        <div className="space-y-3">
          {/* Selector de tipo */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tipo de Archivo
            </label>
            <select
              value={tipoArchivo}
              onChange={(e) => setTipoArchivo(e.target.value as TipoArchivoNC)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-info-500"
            >
              <option value="evidencia_correccion">
                {TIPO_ARCHIVO_LABELS.evidencia_correccion}
              </option>
              <option value="documento_soporte">
                {TIPO_ARCHIVO_LABELS.documento_soporte}
              </option>
              <option value="foto_antes">{TIPO_ARCHIVO_LABELS.foto_antes}</option>
              <option value="foto_despues">{TIPO_ARCHIVO_LABELS.foto_despues}</option>
            </select>
          </div>

          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Seleccionar Archivo
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              className="w-full text-sm text-neutral-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-info-50 file:text-info-700 hover:file:bg-info-100 cursor-pointer"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Máx. 50MB • JPG, PNG, WebP, PDF, Word
            </p>
            {fileError && <p className="mt-1 text-xs text-error-600">{fileError}</p>}
          </div>

          {/* Archivo seleccionado */}
          {selectedFile && !fileError && (
            <div className="flex items-center justify-between p-2 bg-info-50 rounded border border-info-200">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <File className="w-4 h-4 text-info-600 flex-shrink-0" />
                <span className="text-sm text-neutral-700 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-neutral-500">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
              <Button
                type="button"
                size="small"
                variant="primary"
                onClick={handleUpload}
                isLoading={isUploading}
                className="ml-2 flex-shrink-0"
              >
                <Upload className="w-4 h-4 mr-1" />
                Subir
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Archivos - Tabla compacta */}
      <Card compact title={`Archivos (${archivosData?.total || 0})`}>
        {isLoading ? (
          <p className="text-sm text-neutral-500 text-center py-4">Cargando archivos...</p>
        ) : archivosData?.archivos.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No hay archivos adjuntos
          </p>
        ) : (
          <div className="overflow-x-auto -mx-3">
            <table className="min-w-full text-sm divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                    Archivo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                    Tamaño
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {archivosData?.archivos.map((archivo) => {
                  const IconComponent = getFileIcon(archivo.mime_type);
                  return (
                    <tr key={archivo.id_archivo} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-disabled flex-shrink-0" />
                          <span className="text-sm text-neutral-900 truncate max-w-[200px]">
                            {archivo.nombre_original}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Badge size="small" variant="neutral">
                          {TIPO_ARCHIVO_LABELS[archivo.tipo_archivo]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">
                        {formatFileSize(archivo.tamaño_bytes)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-500">
                        {format(parseISO(archivo.created_at), "dd/MM/yy", {
                          locale: es,
                        })}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                archivo.id_archivo,
                                archivo.nombre_original
                              )
                            }
                            className="p-1.5 text-info-600 hover:bg-info-50 rounded transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(archivo.id_archivo)}
                            className="p-1.5 text-error-600 hover:bg-error-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
