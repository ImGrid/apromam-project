/**
 * FichaWorkflowActions
 * Componente para manejar las acciones de workflow de fichas
 * Incluye botones para enviar a revisión, aprobar, rechazar, etc.
 */

import { useState } from "react";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useEnviarRevision } from "../../hooks/useEnviarRevision";
import { useAprobarFicha } from "../../hooks/useAprobarFicha";
import { useRechazarFicha } from "../../hooks/useRechazarFicha";
import {
  getAvailableActions,
} from "./EstadoFichaBadge";
import type { EstadoFicha } from "../../types/ficha.types";

interface FichaWorkflowActionsProps {
  idFicha: string;
  estadoFicha: EstadoFicha;
  onSuccess?: () => void;
}

export function FichaWorkflowActions({
  idFicha,
  estadoFicha,
  onSuccess,
}: FichaWorkflowActionsProps) {
  const user = useAuthStore((state) => state.user);
  const rol = user?.nombre_rol || "";

  const { enviarRevision, isLoading: isEnviando } = useEnviarRevision();
  const { aprobar, isLoading: isAprobando } = useAprobarFicha();
  const { rechazar, isLoading: isRechazando } = useRechazarFicha();

  const [showEnviarModal, setShowEnviarModal] = useState(false);
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);

  const [recomendaciones, setRecomendaciones] = useState("");
  const [firmaInspector, setFirmaInspector] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [motivo, setMotivo] = useState("");

  const availableActions = getAvailableActions(estadoFicha, rol);

  // Handler para enviar a revisión
  const handleEnviarRevision = async () => {
    if (!recomendaciones.trim() || !firmaInspector.trim()) {
      return;
    }

    try {
      await enviarRevision(idFicha, {
        recomendaciones: recomendaciones.trim(),
        firma_inspector: firmaInspector.trim(),
      });
      setShowEnviarModal(false);
      setRecomendaciones("");
      setFirmaInspector("");
      onSuccess?.();
    } catch (err) {
      // El error ya se muestra en el hook
    }
  };

  // Handler para aprobar
  const handleAprobar = async () => {
    try {
      await aprobar(idFicha, {
        comentarios: comentarios.trim() || undefined,
      });
      setShowAprobarModal(false);
      setComentarios("");
      onSuccess?.();
    } catch (err) {
      // El error ya se muestra en el hook
    }
  };

  // Handler para rechazar
  const handleRechazar = async () => {
    if (!motivo.trim()) {
      return;
    }

    try {
      await rechazar(idFicha, {
        motivo: motivo.trim(),
      });
      setShowRechazarModal(false);
      setMotivo("");
      onSuccess?.();
    } catch (err) {
      // El error ya se muestra en el hook
    }
  };

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Enviar a Revisión */}
        {availableActions.includes("enviar_revision") && (
          <Button
            variant="primary"
            onClick={() => setShowEnviarModal(true)}
            disabled={isEnviando}
          >
            <Send className="w-4 h-4" />
            Enviar a Revisión
          </Button>
        )}

        {/* Aprobar */}
        {availableActions.includes("aprobar") && (
          <Button
            variant="primary"
            onClick={() => setShowAprobarModal(true)}
            disabled={isAprobando}
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar Ficha
          </Button>
        )}

        {/* Rechazar */}
        {availableActions.includes("rechazar") && (
          <Button
            variant="secondary"
            onClick={() => setShowRechazarModal(true)}
            disabled={isRechazando}
          >
            <XCircle className="w-4 h-4" />
            Rechazar Ficha
          </Button>
        )}
      </div>

      {/* Modal: Enviar a Revisión */}
      {showEnviarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-text-primary">
              Enviar Ficha a Revisión
            </h2>
            <p className="mb-4 text-sm text-text-secondary">
              La ficha será enviada al gerente para su aprobación. Completa los
              siguientes campos:
            </p>

            <div className="space-y-4">
              {/* Recomendaciones */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-primary">
                  Recomendaciones <span className="text-error">*</span>
                </label>
                <textarea
                  value={recomendaciones}
                  onChange={(e) => setRecomendaciones(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe tus recomendaciones finales..."
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Mínimo 10 caracteres, máximo 2000
                </p>
              </div>

              {/* Firma Inspector */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-primary">
                  Firma del Inspector <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={firmaInspector}
                  onChange={(e) => setFirmaInspector(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe tu nombre completo"
                  minLength={3}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowEnviarModal(false)}
                disabled={isEnviando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleEnviarRevision}
                disabled={
                  isEnviando ||
                  !recomendaciones.trim() ||
                  recomendaciones.trim().length < 10 ||
                  !firmaInspector.trim() ||
                  firmaInspector.trim().length < 3
                }
              >
                {isEnviando ? "Enviando..." : "Enviar a Revisión"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Aprobar Ficha */}
      {showAprobarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-text-primary">
              Aprobar Ficha de Inspección
            </h2>
            <p className="mb-4 text-sm text-text-secondary">
              Esta acción marcará la ficha como <strong>APROBADA</strong> y
              certificada. El productor recibirá la notificación correspondiente.
            </p>

            <div className="space-y-4">
              {/* Comentarios opcionales */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-primary">
                  Comentarios de Aprobación (Opcional)
                </label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Agrega comentarios adicionales si lo deseas..."
                  rows={3}
                  maxLength={2000}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowAprobarModal(false)}
                disabled={isAprobando}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAprobar}
                disabled={isAprobando}
              >
                {isAprobando ? "Aprobando..." : "Confirmar Aprobación"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rechazar Ficha */}
      {showRechazarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-text-primary">
              Rechazar Ficha de Inspección
            </h2>
            <p className="mb-4 text-sm text-text-secondary">
              La ficha será marcada como <strong>RECHAZADA</strong> y el técnico
              recibirá una notificación para realizar las correcciones necesarias.
            </p>

            <div className="space-y-4">
              {/* Motivo del rechazo */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-primary">
                  Motivo del Rechazo <span className="text-error">*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Explica detalladamente por qué se rechaza la ficha y qué debe corregirse..."
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Mínimo 10 caracteres, máximo 2000
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowRechazarModal(false)}
                disabled={isRechazando}
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onClick={handleRechazar}
                disabled={
                  isRechazando ||
                  !motivo.trim() ||
                  motivo.trim().length < 10
                }
              >
                {isRechazando ? "Rechazando..." : "Confirmar Rechazo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
