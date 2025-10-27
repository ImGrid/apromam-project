import { useEffect, useState, type RefObject } from "react";

export interface Position {
  top: number;
  left: number;
  width?: number;
}

interface UsePortalPositionOptions {
  triggerRef: RefObject<HTMLElement | null>;
  contentRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  offset?: number;
  position?: "bottom" | "top" | "left" | "right";
  align?: "start" | "center" | "end";
}

// Hook para calcular la posición dinámica de elementos en portal
export function usePortalPosition({
  triggerRef,
  contentRef,
  isOpen,
  offset = 8,
  position = "bottom",
  align = "center",
}: UsePortalPositionOptions) {
  const [portalPosition, setPortalPosition] = useState<Position>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      // Obtener dimensiones del contenido si está disponible
      const contentRect = contentRef?.current?.getBoundingClientRect();
      const contentWidth = contentRect?.width || 0;
      const contentHeight = contentRect?.height || 0;

      let top = 0;
      let left = 0;

      // Calcular posición según position prop
      switch (position) {
        case "top":
          top = triggerRect.top + scrollY - contentHeight - offset;
          left = triggerRect.left + scrollX;
          break;

        case "bottom":
          top = triggerRect.bottom + scrollY + offset;
          left = triggerRect.left + scrollX;
          break;

        case "left":
          top = triggerRect.top + scrollY;
          left = triggerRect.left + scrollX - contentWidth - offset;
          break;

        case "right":
          top = triggerRect.top + scrollY;
          left = triggerRect.right + scrollX + offset;
          break;
      }

      // Ajustar alineación horizontal para top/bottom
      if (position === "top" || position === "bottom") {
        if (align === "center") {
          left += (triggerRect.width - contentWidth) / 2;
        } else if (align === "end") {
          left += triggerRect.width - contentWidth;
        }
      }

      // Ajustar alineación vertical para left/right
      if (position === "left" || position === "right") {
        if (align === "center") {
          top += (triggerRect.height - contentHeight) / 2;
        } else if (align === "end") {
          top += triggerRect.height - contentHeight;
        }
      }

      setPortalPosition({
        top,
        left,
        width: position === "top" || position === "bottom" ? triggerRect.width : undefined,
      });
    };

    // Calcular posición inicial con un pequeño delay para asegurar que el contenido esté renderizado
    const timer = setTimeout(updatePosition, 0);

    // Recalcular en scroll y resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, triggerRef, contentRef, offset, position, align]);

  return portalPosition;
}
