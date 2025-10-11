import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 20,
  showFirstLast = true,
  className = "",
}: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Calcular rango de items mostrados
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  // Generar array de páginas a mostrar (con elipsis)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5; // Máximo de páginas visibles

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica con elipsis
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Info de rango */}
      {totalItems && startItem && endItem && (
        <div className="order-2 text-sm text-text-secondary sm:order-1">
          Mostrando <span className="font-medium">{startItem}</span> a{" "}
          <span className="font-medium">{endItem}</span> de{" "}
          <span className="font-medium">{totalItems}</span> resultados
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center order-1 gap-1 sm:order-2">
        {/* Primera página */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
            className="p-2 transition-colors rounded-md touch-target disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-bg"
            aria-label="Primera página"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
        )}

        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="p-2 transition-colors rounded-md touch-target disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-bg"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Números de página */}
        <div className="items-center hidden gap-1 sm:flex">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-text-secondary"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`
                  min-w-[44px] min-h-[44px] px-3 py-2 rounded-md
                  text-sm font-medium transition-colors touch-target
                  ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "text-text-primary hover:bg-neutral-bg"
                  }
                `}
                aria-label={`Página ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Mobile: solo muestra página actual */}
        <div className="flex items-center px-3 py-2 sm:hidden">
          <span className="text-sm font-medium text-text-primary">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="p-2 transition-colors rounded-md touch-target disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-bg"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Última página */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
            className="p-2 transition-colors rounded-md touch-target disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-bg"
            aria-label="Última página"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
