import React from "react";
import { Bell, ChevronDown, Calendar } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = "Dashboard",
  subtitle = "Resumen general del sistema de tickets",
  userName = "Juan Pérez",
  userRole = "Supervisor",
}) => {
  return (
    <header className="bg-light-100 border-b border-light-300 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo: Título y descripción */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-dark-900">{title}</h1>
          <p className="text-sm text-dark-600 mt-0.5">{subtitle}</p>
        </div>

        {/* Lado derecho: Acciones y usuario */}
        <div className="flex items-center gap-3">
          {/* Botón de calendario/fecha */}
          <button className="p-2 hover:bg-light-200 rounded-lg transition-colors">
            <Calendar size={20} className="text-dark-600" />
          </button>

          {/* Notificaciones */}
          <button className="relative p-2 hover:bg-light-200 rounded-lg transition-colors">
            <Bell size={20} className="text-dark-600" />
            {/* Badge de notificaciones */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Separador */}
          <div className="w-px h-8 bg-neutral-300"></div>

          {/* Perfil de usuario */}
          <button className="flex items-center gap-3 hover:bg-light-200 rounded-lg px-3 py-2 transition-colors">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-semibold text-dark-900">{userName}</p>
              <p className="text-xs text-dark-500">{userRole}</p>
            </div>
            <ChevronDown size={16} className="text-dark-500" />
          </button>

          {/* Botón Personalizado */}
          <button className="bg-dark-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-dark-700 transition-colors">
            Personalizado
          </button>
        </div>
      </div>
    </header>
  );
};
