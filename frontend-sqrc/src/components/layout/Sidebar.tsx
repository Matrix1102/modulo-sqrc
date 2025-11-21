import React, { useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Ticket,
  BookOpen,
  UserCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type RoleType = "AGENT" | "SUPERVISOR";

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

interface SidebarProps {
  role?: RoleType;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = "AGENT" }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activePath, setActivePath] = useState<string>("/dashboard");

  const menus: Record<RoleType, MenuItem[]> = {
    SUPERVISOR: [
      {
        icon: LayoutDashboard,
        label: "Dashboard Principal",
        path: "/supervisor",
      },
      {
        icon: Ticket,
        label: "Tickets de Equipo",
        path: "/supervisor/tickets",
      },
      {
        icon: ClipboardList,
        label: "Resultados Encuesta",
        path: "/supervisor/encuestas",
      },
    ],
    AGENT: [
      { icon: PlusCircle, label: "Nuevo Ticket", path: "/nuevo-ticket" },
      { icon: Ticket, label: "Mis Casos", path: "/mis-casos" },
      { icon: Search, label: "Vista 360° Cliente", path: "/cliente-360" },
      { icon: BookOpen, label: "Base de Conocimiento", path: "/kb" },
      { icon: UserCircle, label: "Mi Perfil", path: "/perfil" },
    ],
  };

  const menuItems: MenuItem[] = menus[role];

  return (
    <aside
      className={`
                h-screen bg-primary-600 text-white
                transition-all duration-300 ease-in-out
                flex flex-col shadow-xl relative
                ${isCollapsed ? "w-20" : "w-64"}
            `}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center gap-3 p-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 bg-white/20 rounded-lg shrink-0 transition-all hover:bg-white/30 cursor-pointer ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          <LayoutDashboard size={24} />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          <h1 className="font-bold text-lg whitespace-nowrap">Sistema SQRC</h1>
          <p className="text-xs text-primary-200 uppercase tracking-wider">
            {role}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                setActivePath(item.path);
                navigate(item.path);
              }}
              className={`
                            w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            hover:bg-white/10 group relative
                            ${
                              activePath === item.path
                                ? "bg-white/15 shadow-lg"
                                : ""
                            }
                            ${isCollapsed ? "justify-center" : "justify-start"}
                        `}
            >
              <IconComponent
                size={24}
                className={
                  activePath === item.path ? "text-white" : "text-primary-200"
                }
              />

              <span
                className={`
                            whitespace-nowrap font-medium text-sm transition-all duration-300
                            ${
                              isCollapsed
                                ? "w-0 opacity-0 hidden"
                                : "w-auto opacity-100"
                            }
                        `}
              >
                {item.label}
              </span>

              {isCollapsed && (
                <div
                  className="
                                absolute left-full ml-2 bg-dark-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl
                                opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap
                            "
                >
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-700">
        <button
          className={`
                    w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 hover:text-red-100 transition-colors
                    ${isCollapsed ? "justify-center" : "justify-start"}
                `}
        >
          <LogOut size={20} />
          <span
            className={`text-sm font-medium ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
};
