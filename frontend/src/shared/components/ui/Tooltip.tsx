import { useState, useRef, type ReactNode } from "react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

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
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar tooltip en mobile cuando se toca afuera
  useClickOutside(
    containerRef,
    () => setIsVisible(false),
    isVisible && isMobile
  );

  const showTooltip = () => {
    // Detectar si es touch device
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobile(isTouch);

    if (isTouch) {
      // En mobile: toggle on tap
      setIsVisible((prev) => !prev);
    } else {
      // En desktop: show con delay
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isMobile) {
      setIsVisible(false);
    }
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900",
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={showTooltip}
        className="cursor-help"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-50
            px-3 py-2 text-sm text-white bg-gray-900 rounded-md
            shadow-lg max-w-xs
            animate-in fade-in-0 zoom-in-95
            duration-200
            ${positionClasses[position]}
          `}
        >
          {content}

          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 rotate-45
              ${arrowClasses[position]}
            `}
            style={{ borderWidth: "1px 1px 0 0" }}
          />
        </div>
      )}
    </div>
  );
}
