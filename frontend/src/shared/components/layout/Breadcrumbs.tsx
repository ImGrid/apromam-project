/**
 * Breadcrumbs de navegacion
 * Muestra ruta actual y permite navegar hacia atras
 */

import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { ROUTES } from "@/shared/config/routes.config";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumbs() {
  const location = useLocation();

  // Generar breadcrumbs desde la ruta actual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", path: ROUTES.DASHBOARD },
    ];

    // Mapeo de rutas a labels
    const routeLabels: Record<string, string> = {
      usuarios: "Usuarios",
      comunidades: "Comunidades",
      geograficas: "Geografía",
      provincias: "Provincias",
      municipios: "Municipios",
      catalogos: "Catálogos",
      "tipos-cultivo": "Tipos de Cultivo",
      gestiones: "Gestiones",
      productores: "Productores",
      parcelas: "Parcelas",
      fichas: "Fichas",
      crear: "Crear",
      editar: "Editar",
    };

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = routeLabels[path] || path;

      // El ultimo item no tiene link
      breadcrumbs.push({
        label,
        path: index === paths.length - 1 ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // No mostrar breadcrumbs en dashboard root
  if (location.pathname === ROUTES.DASHBOARD) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-2 text-sm"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <div key={crumb.path || crumb.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-text-secondary" />
            )}

            {crumb.path ? (
              <Link
                to={crumb.path}
                className="flex items-center gap-1 transition-colors text-text-secondary hover:text-primary"
              >
                {isFirst && <Home className="w-4 h-4" />}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span className="font-medium text-text-primary">
                {crumb.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
