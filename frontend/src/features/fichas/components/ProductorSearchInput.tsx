/**
 * ProductorSearchInput Component
 * Input de búsqueda de productores con autocompletado
 * Permite buscar por código o nombre del productor
 */

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useSearchProductor } from "../hooks/useSearchProductor";
import type { Productor } from "@/features/productores/types/productor.types";

export interface ProductorSearchInputProps {
  onSelectProductor: (productor: Productor) => void;
  selectedProductor?: Productor | null;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductorSearchInput({
  onSelectProductor,
  selectedProductor,
  placeholder = "Buscar por código (ej: VPST01) o nombre del productor...",
  disabled = false,
}: ProductorSearchInputProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { productores, isLoading, error, searchProductor, clearResults } =
    useSearchProductor();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchProductor(value);
    setShowDropdown(true);
  };

  const handleSelectProductor = (productor: Productor) => {
    onSelectProductor(productor);
    setQuery("");
    clearResults();
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onSelectProductor(null as any);
    setQuery("");
    clearResults();
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Productor seleccionado */}
      {selectedProductor ? (
        <div className="flex items-center gap-3 p-4 bg-white border rounded-lg border-neutral-border">
          <div className="flex-1">
            <p className="font-semibold text-text-primary">
              {selectedProductor.nombre_productor}
            </p>
            <p className="text-sm text-text-secondary">
              Código: <span className="font-mono">{selectedProductor.codigo_productor}</span>
              {selectedProductor.nombre_comunidad && (
                <> • {selectedProductor.nombre_comunidad}</>
              )}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-2 transition-colors rounded-lg text-text-secondary hover:bg-neutral-100"
              title="Cambiar productor"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Input de búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-disabled animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-disabled" />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query && setShowDropdown(true)}
              disabled={disabled}
              className="w-full py-3 pl-10 pr-4 text-base border rounded-lg border-neutral-border focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
              placeholder={placeholder}
            />
          </div>

          {/* Dropdown de resultados */}
          {showDropdown && (query.length >= 2) && (
            <div className="absolute z-50 w-full mt-2 overflow-hidden bg-white border rounded-lg shadow-lg border-neutral-border max-h-80">
              {error && (
                <div className="p-4 text-sm text-error-600 bg-error-50">
                  {error}
                </div>
              )}

              {!error && productores.length === 0 && !isLoading && (
                <div className="p-4 text-sm text-center text-tertiary">
                  No se encontraron productores
                </div>
              )}

              {!error && productores.length > 0 && (
                <div className="overflow-y-auto max-h-80">
                  {productores.map((productor) => (
                    <button
                      key={productor.codigo_productor}
                      type="button"
                      onClick={() => handleSelectProductor(productor)}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-neutral-50 focus:bg-neutral-100 focus:outline-none"
                    >
                      <p className="font-medium text-text-primary">
                        {productor.nombre_productor}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <span className="font-mono font-semibold">
                          {productor.codigo_productor}
                        </span>
                        {productor.nombre_comunidad && (
                          <> • {productor.nombre_comunidad}</>
                        )}
                        {productor.nombre_municipio && (
                          <>, {productor.nombre_municipio}</>
                        )}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {productor.superficie_total_has} has •{" "}
                        {productor.numero_parcelas_total}{" "}
                        {productor.numero_parcelas_total === 1
                          ? "parcela"
                          : "parcelas"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
