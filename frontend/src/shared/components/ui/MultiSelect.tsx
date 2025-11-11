import { useState, useRef, forwardRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { usePortalPosition } from "@/shared/hooks/usePortalPosition";
import type { SelectOption } from "./Select";

interface MultiSelectProps {
  options: SelectOption[];
  value?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  className?: string;
  maxSelected?: number;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = "Selecciona opciones",
      label,
      error,
      disabled = false,
      searchable = false,
      required = false,
      className = "",
      maxSelected,
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
        searchInputRef.current.focus({ preventScroll: true });
      }
    }, [isOpen, searchable]);

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const handleToggle = (optionValue: string) => {
      if (value.includes(optionValue)) {
        // Deseleccionar
        onChange(value.filter((v) => v !== optionValue));
      } else {
        // Seleccionar (si no se alcanzó el máximo)
        if (!maxSelected || value.length < maxSelected) {
          onChange([...value, optionValue]);
        }
      }
    };

    const handleRemove = (optionValue: string, e: React.SyntheticEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== optionValue));
    };

    const handleClear = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      onChange([]);
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
            {maxSelected && (
              <span className="ml-2 text-xs text-text-secondary">
                (máx. {maxSelected})
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
          <div className="flex flex-wrap items-center flex-1 gap-1 min-h-[24px]">
            {selectedOptions.length === 0 ? (
              <span className="text-text-secondary">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
                >
                  {option.label}
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleRemove(option.value, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRemove(option.value, e);
                        }
                      }}
                      className="hover:text-primary-dark focus:outline-none cursor-pointer"
                      aria-label={`Remover ${option.label}`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-1">
            {selectedOptions.length > 0 && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClear(e);
                  }
                }}
                className="p-1 rounded hover:bg-neutral-bg focus:outline-none cursor-pointer"
                aria-label="Limpiar selección"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </span>
            )}
            <ChevronDown
              className={`w-5 h-5 text-text-secondary transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
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
                aria-multiselectable="true"
                className="overflow-y-auto max-h-52"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-center text-text-secondary">
                    No hay opciones disponibles
                  </li>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value);
                    const isDisabled =
                      option.disabled ||
                      (!isSelected &&
                        maxSelected !== undefined &&
                        value.length >= maxSelected);

                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => handleToggle(option.value)}
                          disabled={isDisabled}
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
                              isDisabled
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

              {/* Footer con contador */}
              {maxSelected && (
                <div className="px-4 py-2 text-xs text-center border-t border-neutral-border text-text-secondary">
                  {value.length} / {maxSelected} seleccionados
                </div>
              )}
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

MultiSelect.displayName = "MultiSelect";
