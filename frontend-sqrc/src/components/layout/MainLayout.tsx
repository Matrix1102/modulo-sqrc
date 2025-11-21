import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  role: "AGENT" | "SUPERVISOR";
}

export default function MainLayout({ role }: Readonly<MainLayoutProps>) {
  return (
    <div className="flex h-screen bg-sqrc-bg-main">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar role={role} />

      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar fijo arriba */}
        <Navbar
          title="Dashboard"
          subtitle="Resumen general del sistema de tickets"
          userName="Juan Pérez"
          userRole={role === "SUPERVISOR" ? "Supervisor" : "Agente"}
        />

        {/* Contenido dinámico - Aquí se renderizan las rutas hijas */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-sqrc-lg bg-sqrc-bg-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
