import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { GestionIndicator } from "@/features/configuracion/components/GestionIndicator";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm border-neutral-border sm:px-6 lg:pl-6">
      {/* Left side - Hamburger menu (mobile) */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center p-2 rounded-md lg:hidden text-text-secondary hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Titulo */}
        <h1 className="text-base sm:text-lg font-semibold text-text-primary truncate min-w-0">{title}</h1>
      </div>

      {/* Right side - Gestion indicator & User menu */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <GestionIndicator />
        <UserMenu />
      </div>
    </header>
  );
}
