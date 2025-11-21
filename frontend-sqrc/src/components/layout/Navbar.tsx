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
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo: Título y descripción */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Lado derecho: Acciones y usuario */}
        <div className="flex items-center gap-3">
          {/* Botón de calendario/fecha */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Calendar size={20} className="text-gray-600" />
          </button>

          {/* Notificaciones */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            {/* Badge de notificaciones */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Perfil de usuario */}
          <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {/* Botón Personalizado */}
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Personalizado
          </button>
        </div>
      </div>
    </header>
  );
};
