/**
 * FichaCreatePage
 * Página para crear una nueva ficha de inspección
 * Estructura IDÉNTICA a páginas con AdminLayout pero usa FichaLayout + FichaSidebar
 */

import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FichaLayout } from "@/shared/components/layout/FichaLayout";
import { FichaMultiStepForm, FichaSidebar, STEP_CONFIGS } from "../components/FichaMultiStepForm";
import { useCreateFicha } from "../hooks/useCreateFicha";
import { ROUTES } from "@/shared/config/routes.config";
import type { CreateFichaCompletaInput } from "../types/ficha.types";

export default function FichaCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createFicha } = useCreateFicha();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Leer query params para "Continuar" con un borrador
  const productor = searchParams.get("productor");
  const gestion = searchParams.get("gestion");

  const initialData = useMemo(() => {
    if (productor && gestion) {
      return {
        ficha: {
          codigo_productor: productor,
          gestion: parseInt(gestion, 10),
        },
      };
    }
    return undefined;
  }, [productor, gestion]);

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
      <FichaMultiStepForm
        onSubmit={handleSubmit}
        mode="create"
        initialData={initialData}
        codigoProductorFromUrl={productor || undefined}
        gestionFromUrl={gestion ? parseInt(gestion, 10) : undefined}
      />
    </FichaLayout>
  );
}
