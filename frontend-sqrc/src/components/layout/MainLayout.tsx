import { Outlet, useLocation } from "react-router-dom"; // Importar useLocation
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  role: "AGENT" | "SUPERVISOR";
}

// 1. Diccionario de Títulos (Configuración Centralizada)
const PAGE_CONFIG: Record<string, { title: string; subtitle: string }> = {
  // Rutas Supervisor
  "/supervisor": {
    title: "Dashboard",
    subtitle: "Resumen general del sistema de tickets",
  },
  "/supervisor/encuestas": {
    title: "Resultados de Encuesta",
    subtitle: "Feedback recibido de los clientes",
  },
  "/supervisor/ticketing": {
    title: "Tickets de Equipo",
    subtitle: "Gestión de los tickets asignados al equipo",
  },

  // Rutas Agente
  "/agente/tickets": {
    title: "Gestión de Tickets",
    subtitle: "Administra tus casos asignados",
  },

  // Default
  default: {
    title: "Sistema SQRC",
    subtitle: "Panel de Control",
  },
};

export default function MainLayout({ role }: Readonly<MainLayoutProps>) {
  const location = useLocation();

  // 2. Calcular título actual
  // Buscamos la ruta exacta, si no existe, usamos el default
  const currentPath = location.pathname; // ej: "/supervisor/encuestas"
  const pageInfo = PAGE_CONFIG[currentPath] || PAGE_CONFIG["default"];

  return (
    <div className="flex h-screen bg-light-200">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 3. Pasamos los datos dinámicos al Navbar */}
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          userName={role === "SUPERVISOR" ? "Juan Pérez" : "Ana Agente"}
          userRole={role === "SUPERVISOR" ? "Supervisor" : "Agente de Soporte"}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-light-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
