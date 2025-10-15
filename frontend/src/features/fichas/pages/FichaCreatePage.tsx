/**
 * FichaCreatePage
 * Página para crear una nueva ficha de inspección
 * Estructura IDÉNTICA a páginas con AdminLayout pero usa FichaLayout + FichaSidebar
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FichaLayout } from "@/shared/components/layout/FichaLayout";
import { FichaMultiStepForm, FichaSidebar, STEP_CONFIGS } from "../components/FichaMultiStepForm";
import { useCreateFicha } from "../hooks/useCreateFicha";
import { ROUTES } from "@/shared/config/routes.config";
import type { CreateFichaCompletaInput } from "../types/ficha.types";

export default function FichaCreatePage() {
  const navigate = useNavigate();
  const { createFicha } = useCreateFicha();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSubmit = async (data: CreateFichaCompletaInput) => {
    const ficha = await createFicha(data);
    // Redirigir al detalle de la ficha creada
    navigate(ROUTES.FICHAS_DETAIL(ficha.ficha.id_ficha));
  };

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const handleMobileSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  return (
    <FichaLayout
      title="Nueva Ficha de Inspección"
      onMobileMenuToggle={handleMobileMenuToggle}
      sidebar={
        <FichaSidebar
          steps={STEP_CONFIGS}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
        />
      }
    >
      <FichaMultiStepForm onSubmit={handleSubmit} mode="create" />
    </FichaLayout>
  );
}
