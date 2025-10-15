/**
 * Accordion Component
 * Componente reutilizable para contenido colapsable
 */

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface AccordionProps {
  title: string | ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className = "",
  headerClassName = "",
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-lg border-neutral-border bg-white ${className}`}>
      {/* Header - Clickeable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${headerClassName}`}
      >
        <div className="flex-1">{title}</div>
        <div className="flex-shrink-0 ml-4">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Content - Colapsable */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-neutral-border">
          {children}
        </div>
      )}
    </div>
  );
}
