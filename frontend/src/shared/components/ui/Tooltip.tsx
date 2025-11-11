import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortalPosition } from "@/shared/hooks/usePortalPosition";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calcular posición dinámica
  const tooltipPosition = usePortalPosition({
    triggerRef,
    contentRef: tooltipRef,
    isOpen: isVisible,
    offset: 8,
    position: position,
    align: "center",
  });

  const showTooltip = () => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show con delay
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    // Limpiar timeout si está esperando
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Ocultar inmediatamente
    setIsVisible(false);
  };

  // Limpiar timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {/* Tooltip - Renderizado en Portal */}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "absolute",
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="px-3 py-2 text-sm text-white bg-neutral-900 rounded-md shadow-lg max-w-xs animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
