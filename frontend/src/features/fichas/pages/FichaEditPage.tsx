/**
 * FichaEditPage
 * Página para editar una ficha existente
 * Estructura IDÉNTICA a páginas con AdminLayout pero usa FichaLayout + FichaSidebar
 */

import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { FichaLayout } from "@/shared/components/layout/FichaLayout";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Alert";
import { FichaMultiStepForm, FichaSidebar, STEP_CONFIGS } from "../components/FichaMultiStepForm";
import { useFichaCompleta } from "../hooks/useFichaCompleta";
import { fichasService } from "../services/fichas.service";
import { ROUTES } from "@/shared/config/routes.config";
import { isEditable } from "../components/Specialized";
import type { CreateFichaCompletaInput } from "../types/ficha.types";

export default function FichaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ficha, isLoading, error } = useFichaCompleta(id);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSubmit = async (data: CreateFichaCompletaInput) => {
    if (!id) return;
    await fichasService.updateCompleta(id, data);
    // Redirigir al detalle de la ficha
    navigate(ROUTES.FICHAS_DETAIL(id));
  };

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const handleMobileSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Sidebar compartido
  const sidebar = (
    <FichaSidebar
      steps={STEP_CONFIGS}
      isMobileOpen={isMobileSidebarOpen}
      onMobileClose={handleMobileSidebarClose}
    />
  );

  // Loading state
  if (isLoading) {
    return (
      <FichaLayout title="Editar Ficha" sidebar={sidebar} onMobileMenuToggle={handleMobileMenuToggle}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin border-primary border-t-transparent"></div>
            <p className="text-text-secondary">Cargando ficha...</p>
          </div>
        </div>
      </FichaLayout>
    );
  }

  // Error state
  if (error || !ficha) {
    return (
      <FichaLayout title="Error" sidebar={sidebar} onMobileMenuToggle={handleMobileMenuToggle}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert
            type="error"
            message={
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Error al cargar la ficha</p>
                  <p className="mt-1 text-sm">{error || "Ficha no encontrada"}</p>
                </div>
              </div>
            }
          />
          <div className="mt-4">
            <Button onClick={() => navigate(ROUTES.FICHAS)}>
              <ArrowLeft className="w-4 h-4" />
              Volver a Fichas
            </Button>
          </div>
        </div>
      </FichaLayout>
    );
  }

  // Check if ficha is editable
  const canEdit = isEditable(ficha.ficha.estado_ficha);

  if (!canEdit) {
    return (
      <FichaLayout title="Ficha No Editable" sidebar={sidebar} onMobileMenuToggle={handleMobileMenuToggle}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert
            type="warning"
            message={
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    Esta ficha no puede ser editada
                  </p>
                  <p className="mt-1 text-sm">
                    El estado actual de la ficha (
                    <strong>{ficha.ficha.estado_ficha}</strong>) no permite
                    modificaciones.
                  </p>
                </div>
              </div>
            }
          />
          <div className="mt-4">
            <Button onClick={() => navigate(ROUTES.FICHAS_DETAIL(id!))}>
              <ArrowLeft className="w-4 h-4" />
              Ver Detalle
            </Button>
          </div>
        </div>
      </FichaLayout>
    );
  }

  // Usar la ficha completa como initialData (el formulario lo convertirá a CreateFichaCompletaInput)
  const initialData = ficha;

  return (
    <FichaLayout
      title={`Editar Ficha - ${ficha.ficha.codigo_productor}`}
      onMobileMenuToggle={handleMobileMenuToggle}
      sidebar={sidebar}
    >
      <FichaMultiStepForm
        initialData={initialData}
        onSubmit={handleSubmit}
        mode="edit"
        fichaId={id}
      />
    </FichaLayout>
  );
}
