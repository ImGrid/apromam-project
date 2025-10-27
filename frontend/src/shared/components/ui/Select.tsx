import { useState, useRef, forwardRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { usePortalPosition } from "@/shared/hooks/usePortalPosition";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Selecciona una opción",
      label,
      error,
      disabled = false,
      searchable = false,
      required = false,
      className = "",
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Calcular posición dinámica para el portal
    const portalPosition = usePortalPosition({
      triggerRef: buttonRef,
      contentRef: dropdownRef,
      isOpen,
      offset: 8,
      position: "bottom",
    });

    // Cerrar cuando se hace clic fuera
    useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

    // Focus en el input de búsqueda sin causar scroll
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        // Usar preventScroll para evitar el salto de página
        searchInputRef.current.focus({ preventScroll: true });
      }
    }, [isOpen, searchable]);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    };

    return (
      <div className={`relative ${className}`} ref={containerRef}>
        {/* Label */}
        {label && (
          <label className="block mb-2 text-sm font-medium text-text-primary">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}

        {/* Select trigger */}
        <button
          ref={(node) => {
            buttonRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`
            w-full min-h-[48px] px-4 py-3 text-left
            bg-white border rounded-md
            flex items-center justify-between gap-2
            transition-colors touch-target
            ${
              error
                ? "border-error focus:ring-error"
                : "border-neutral-border focus:ring-primary focus:border-primary"
            }
            ${disabled ? "bg-neutral-bg cursor-not-allowed opacity-60" : ""}
            focus:outline-none focus:ring-2 focus:ring-offset-1
          `}
        >
          <span
            className={`flex items-center gap-2 ${
              !selectedOption ? "text-text-secondary" : "text-text-primary"
            }`}
          >
            {selectedOption?.icon && <span>{selectedOption.icon}</span>}
            {selectedOption?.label || placeholder}
          </span>

          <ChevronDown
            className={`w-5 h-5 text-text-secondary transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown - Renderizado en Portal */}
        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: `${portalPosition.top}px`,
                left: `${portalPosition.left}px`,
                width: `${portalPosition.width}px`,
                zIndex: 9999,
              }}
              className="overflow-hidden bg-white border rounded-md shadow-lg border-neutral-border max-h-64 animate-in fade-in-0 zoom-in-95 duration-100"
            >
              {/* Search input */}
              {searchable && (
                <div className="p-2 border-b border-neutral-border">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-text-secondary" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full py-2 pl-10 pr-3 text-sm border rounded-md border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Options list */}
              <ul
                role="listbox"
                className="overflow-y-auto max-h-52"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-center text-text-secondary">
                    No hay opciones disponibles
                  </li>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          disabled={option.disabled}
                          role="option"
                          aria-selected={isSelected}
                          className={`
                            w-full px-4 py-3 text-left text-sm
                            flex items-center justify-between gap-2
                            transition-colors touch-target
                            ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-text-primary hover:bg-neutral-bg"
                            }
                            ${
                              option.disabled
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          `}
                        >
                          <span className="flex items-center gap-2">
                            {option.icon && <span>{option.icon}</span>}
                            {option.label}
                          </span>

                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            document.body
          )}

        {/* Error message */}
        {error && (
          <p className="flex items-start gap-1 mt-2 text-sm text-error">
            <svg
              className="flex-shrink-0 w-4 h-4 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
