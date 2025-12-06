import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { IncomingCallWidget } from "../../features/tickets/components/IncomingCallWidget";
import { useCallSimulatorContext } from "../../features/tickets/hooks/useCallSimulatorContext";
import { useUser } from "../../context/UserContext";

interface MainLayoutProps {
  role: "SUPERVISOR" | "BACKOFFICE" | "AGENTE_LLAMADA" | "AGENTE_PRESENCIAL";
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
  "/supervisor/encuestas/agentes": {
    title: "Encuestas sobre Agentes",
    subtitle: "Detalle de evaluaciones por personal",
  },
  "/supervisor/encuestas/servicios": {
    title: "Encuestas sobre Servicios",
    subtitle: "Detalle de evaluaciones por tipo de servicio",
  },

  // --- AGENTE LLAMADA ---
  "/agente-llamada": {
    title: "Gestión de Tickets",
    subtitle: "Atención telefónica de clientes",
  },
  "/agente-llamada/tickets": {
    title: "Gestión de Tickets",
    subtitle: "Atención telefónica de clientes",
  },
  "/agente-llamada/cliente-360": {
    title: "Vista 360° Cliente",
    subtitle: "Perfil completo del cliente - Call Center",
  },
  "/agente-llamada/base-conocimiento": {
    title: "Base de Conocimiento",
    subtitle: "Artículos y guías de resolución",
  },

  // --- AGENTE PRESENCIAL ---
  "/agente-presencial": {
    title: "Gestión de Tickets",
    subtitle: "Atención presencial en oficina",
  },
  "/agente-presencial/tickets": {
    title: "Gestión de Tickets",
    subtitle: "Atención presencial en oficina",
  },
  "/agente-presencial/cliente-360": {
    title: "Vista 360° Cliente",
    subtitle: "Perfil completo del cliente - Oficina",
  },
  "/agente-presencial/base-conocimiento": {
    title: "Base de Conocimiento",
    subtitle: "Artículos y guías de resolución",
  },

  // --- BACKOFFICE ---
  "/backoffice": {
    title: "Gestión de Tickets",
    subtitle: "Tickets escalados y casos complejos",
  },
  "/backoffice/tickets": {
    title: "Gestión de Tickets",
    subtitle: "Tickets escalados y casos complejos",
  },
  "/backoffice/base-conocimiento": {
    title: "Base de Conocimiento",
    subtitle: "Artículos y guías de resolución",
  },

   // --- SUPERVISOR BASE DE CONOCIMIENTO ---
  "/supervisor/base-conocimiento": {
    title: "Base de Conocimiento",
    subtitle: "Gestión y aprobación de artículos",
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
    prefix: "/agente-llamada/tickets/",
    title: "Trabajando Ticket",
    subtitle: "Detalles del caso - Call Center",
  },
  {
    prefix: "/agente-presencial/tickets/",
    title: "Trabajando Ticket",
    subtitle: "Detalles del caso - Atención Presencial",
  },
  {
    prefix: "/backoffice/tickets/",
    title: "Detalle del Ticket",
    subtitle: "Análisis y resolución del caso escalado",
  },
];

// Empleados de la BD local (del script V4_add_tickets.sql)
const getUserName = (role: MainLayoutProps["role"]): string => {
  switch (role) {
    case "SUPERVISOR":
      return "Roberto Manager";  // ID 1
    case "BACKOFFICE":
      return "Jorge Resolver";   // ID 3
    case "AGENTE_LLAMADA":
      return "Sofia Call";       // ID 6
    case "AGENTE_PRESENCIAL":
      return "Fernando Face";    // ID 9
  }
};

const getUserRole = (role: MainLayoutProps["role"]): string => {
  switch (role) {
    case "SUPERVISOR":
      return "Supervisor";
    case "BACKOFFICE":
      return "Backoffice";
    case "AGENTE_LLAMADA":
      return "Agente de Llamada";
    case "AGENTE_PRESENCIAL":
      return "Agente Presencial";
  }
};

export default function MainLayout({ role }: Readonly<MainLayoutProps>) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useUser();

  // Obtener el estado del simulador de llamadas desde el context
  const isCallAgent = role === "AGENTE_LLAMADA" || user?.id === 6 || user?.id === 7 || user?.id === 8;
  const {
    currentCall,
    isActive,
    acceptCall,
    declineCall,
    finalizeCall,
  } = useCallSimulatorContext();

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
          userName={getUserName(role)}
          userRole={getUserRole(role)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-light-200">
          <Outlet />
        </main>
      </div>

      {/* Widget de llamada entrante (solo para agentes de llamada) */}
      {isCallAgent && (
        <IncomingCallWidget
          call={currentCall}
          onAccept={acceptCall}
          onDecline={declineCall}
          onFinalize={finalizeCall}
          isActive={isActive}
        />
      )}
    </div>
  );
}
