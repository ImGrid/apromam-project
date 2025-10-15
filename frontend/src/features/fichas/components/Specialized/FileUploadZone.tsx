/**
 * FileUploadZone
 * Componente para subir archivos con drag & drop, validación y preview
 */

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, FileImage, FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { showToast } from "@/shared/hooks/useToast";

export type FileType = "croquis" | "foto_parcela" | "documento_pdf";

interface FileUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  accept: string; // 'image/*', '.pdf', etc
  maxSize: number; // en MB
  tipoArchivo: FileType;
  preview?: string; // URL del archivo ya subido
  disabled?: boolean;
  multiple?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export function FileUploadZone({
  onUpload,
  accept,
  maxSize,
  tipoArchivo,
  preview,
  disabled = false,
  multiple = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = {
    croquis: "Croquis de la unidad",
    foto_parcela: "Fotos de parcelas",
    documento_pdf: "Documentos PDF",
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validar tipo
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    const isValidType =
      acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const baseType = type.split("/")[0];
          return fileType.startsWith(baseType + "/");
        }
        return type === fileType || type === fileExtension;
      }) || accept === "*";

    if (!isValidType) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Solo se aceptan: ${accept}`,
      };
    }

    // Validar tamaño
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `El archivo excede el tamaño máximo de ${maxSize}MB`,
      };
    }

    return { valid: true };
  };

  const handleFiles = async (fileList: FileList) => {
    if (disabled) return;

    const filesToProcess = Array.from(fileList);

    // Si no es multiple, solo el primero
    if (!multiple && filesToProcess.length > 0) {
      const file = filesToProcess[0];
      const validation = validateFile(file);

      if (!validation.valid) {
        showToast.error(`Archivo inválido: ${validation.error}`);
        return;
      }

      // Crear preview si es imagen
      let previewUrl: string | undefined;
      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
      }

      const uploadFile: UploadedFile = {
        file,
        preview: previewUrl,
        uploading: true,
        uploaded: false,
      };

      setFiles([uploadFile]);

      // Upload
      try {
        await onUpload(file);
        setFiles([{ ...uploadFile, uploading: false, uploaded: true }]);
        showToast.success("El archivo se subió correctamente");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al subir archivo";
        setFiles([
          {
            ...uploadFile,
            uploading: false,
            uploaded: false,
            error: errorMessage,
          },
        ]);
        showToast.error(`Error al subir: ${errorMessage}`);
      }
    }

    // Multiple files
    if (multiple) {
      for (const file of filesToProcess) {
        const validation = validateFile(file);
        if (!validation.valid) {
          showToast.error(`${file.name} inválido: ${validation.error}`);
          continue;
        }

        let previewUrl: string | undefined;
        if (file.type.startsWith("image/")) {
          previewUrl = URL.createObjectURL(file);
        }

        const uploadFile: UploadedFile = {
          file,
          preview: previewUrl,
          uploading: true,
          uploaded: false,
        };

        setFiles((prev) => [...prev, uploadFile]);

        try {
          await onUpload(file);
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, uploading: false, uploaded: true }
                : f
            )
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error al subir archivo";
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    uploading: false,
                    uploaded: false,
                    error: errorMessage,
                  }
                : f
            )
          );
        }
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Revocar URL del preview
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed bg-neutral-bg" : "cursor-pointer hover:border-primary"}
          ${isDragging ? "border-primary bg-primary/5" : "border-neutral-border"}
        `}
        onClick={disabled ? undefined : openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          multiple={multiple}
          className="sr-only"
        />

        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isDragging ? "bg-primary/10" : "bg-neutral-bg"}
          `}
          >
            <Upload
              className={`w-6 h-6 ${
                isDragging ? "text-primary" : "text-text-secondary"
              }`}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              {isDragging
                ? "Suelta el archivo aquí"
                : "Arrastra y suelta o haz clic para seleccionar"}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {labels[tipoArchivo]} • {accept} • Máx. {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg border-neutral-border"
            >
              {/* Preview o icono */}
              <div className="flex-shrink-0">
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt="Preview"
                    className="object-cover w-12 h-12 rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-neutral-bg">
                    <FileText className="w-6 h-6 text-text-secondary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-text-primary">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Estado */}
                {uploadedFile.uploading && (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-xs text-primary">Subiendo...</span>
                  </div>
                )}

                {uploadedFile.uploaded && (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs text-success">Subido</span>
                  </div>
                )}

                {uploadedFile.error && (
                  <p className="mt-1 text-xs text-error">
                    {uploadedFile.error}
                  </p>
                )}
              </div>

              {/* Botón eliminar */}
              {!uploadedFile.uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview existente */}
      {preview && files.length === 0 && (
        <div className="p-3 border rounded-lg border-success/20 bg-success/5">
          <div className="flex items-center gap-3">
            <FileImage className="w-5 h-5 text-success" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success">
                Archivo existente
              </p>
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Ver archivo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
