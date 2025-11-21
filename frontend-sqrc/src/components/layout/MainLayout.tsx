import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  role: "AGENT" | "SUPERVISOR";
}

export default function MainLayout({ role }: Readonly<MainLayoutProps>) {
  return (
    <div className="flex h-screen bg-light-200">
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-light-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}