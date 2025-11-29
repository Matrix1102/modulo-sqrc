import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  role: "AGENT" | "SUPERVISOR";
}

// 1. Diccionario de Títulos Ampliado
const PAGE_CONFIG: Record<string, { title: string; subtitle: string }> = {
  // --- SUPERVISOR ---
  "/supervisor": {
    title: "Dashboard",
    subtitle: "Resumen general del sistema de tickets",
  },
  "/supervisor/ticketing": {
    title: "Tickets de Equipo",
    subtitle: "Gestión de los tickets asignados al equipo",
  },
  "/supervisor/tickets": {
    title: "Tickets de Equipo",
    subtitle: "Gestión de los tickets asignados al equipo",
  },
  "/supervisor/encuestas": {
    title: "Resultados de Encuesta",
    subtitle: "Feedback recibido de los clientes",
  },
  "/supervisor/tickets/agente/": {
    title: "Detalle de Agente",
    subtitle: "Historial de tickets del agente seleccionado",
  },
  // Nuevas rutas de Encuestas (Nivel 2)
  "/supervisor/encuestas/agentes": {
    title: "Encuestas sobre Agentes",
    subtitle: "Detalle de evaluaciones por personal",
  },
  "/supervisor/encuestas/servicios": {
    title: "Encuestas sobre Servicios",
    subtitle: "Detalle de evaluaciones por tipo de servicio",
  },

  // --- AGENTE ---
  "/agente/tickets": {
    title: "Gestión de Tickets",
    subtitle: "Administra tus casos asignados",
  },
  "/agente/nuevo-ticket": {
    title: "Nuevo Ticket",
    subtitle: "Registrar una nueva solicitud o reclamo",
  },
  "/agente/mis-casos": {
    title: "Mis Casos",
    subtitle: "Historial de atenciones realizadas",
  },
  "/cliente-360": {
    title: "Vista 360° Cliente",
    subtitle: "Consulta el perfil completo y las métricas del cliente",
  },
  "/kb": {
    title: "Base de Conocimiento",
    subtitle: "Artículos y guías de resolución",
  },
  "/perfil": {
    title: "Mi Perfil",
    subtitle: "Configuración de cuenta y preferencias",
  },

  // --- DEFAULT ---
  default: {
    title: "Sistema SQRC",
    subtitle: "Panel de Control",
  },
};

// Configuración especial para rutas dinámicas (detectadas por prefijo)
const DYNAMIC_ROUTES = [
  {
    prefix: "/supervisor/ticketing/agentes/",
    title: "Detalle de Agente",
    subtitle: "Historial de tickets del agente seleccionado",
  },
  {
    prefix: "/supervisor/ticketing/detalle/",
    title: "Detalle del Ticket",
    subtitle: "Gestión y resolución del caso",
  },
  // Also support the 'tickets' namespace (some routes use 'tickets' instead of 'ticketing')
  {
    prefix: "/supervisor/tickets/agente/",
    title: "Detalle de Agente",
    subtitle: "Historial de tickets del agente seleccionado",
  },
  {
    prefix: "/supervisor/tickets/detalle/",
    title: "Detalle del Ticket",
    subtitle: "Gestión y resolución del caso",
  },
  {
    prefix: "/agente/tickets/",
    title: "Trabajando Ticket",
    subtitle: "Detalles y acciones del caso",
  },
];

export default function MainLayout({ role }: Readonly<MainLayoutProps>) {
  const location = useLocation();
  const currentPath = location.pathname;

  // 2. Lógica de Selección de Título Inteligente
  const getPageInfo = () => {
    // A) Intenta coincidencia exacta (ej: /supervisor)
    if (PAGE_CONFIG[currentPath]) {
      return PAGE_CONFIG[currentPath];
    }

    // B) Intenta coincidencia por prefijo (para rutas con ID: /detalle/123)
    const dynamicMatch = DYNAMIC_ROUTES.find((route) =>
      currentPath.startsWith(route.prefix)
    );
    if (dynamicMatch) {
      return { title: dynamicMatch.title, subtitle: dynamicMatch.subtitle };
    }

    // C) Fallback
    return PAGE_CONFIG["default"];
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-light-200">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col overflow-hidden">
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
