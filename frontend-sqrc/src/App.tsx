import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

import TicketsPage from "./pages/agente/TicketsPage";
import DashboardPage from "./pages/supervisor/DashboardPage";

// Un Home temporal para que puedas navegar
const Home = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
    <h1 className="text-4xl font-bold">Sistema SQRC</h1>
    <div className="flex gap-4">
      {/* Enlace directo a la página de Tickets del Agente */}
      <Link
        to="/agente/tickets"
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
      >
        Soy Agente (Ver Tickets)
      </Link>
      {/* Enlace directo al Dashboard del Supervisor */}
      <Link
        to="/supervisor"
        className="px-6 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition"
      >
        Soy Supervisor (Ver Dashboard)
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública (Inicio) */}
        <Route path="/" element={<Home />} />

        {/* ─── ZONA AGENTE ─── */}
        <Route path="/agente" element={<MainLayout role="AGENT" />}>
          {/* Según tu carpeta, aquí vive la página de Tickets */}
          <Route path="tickets" element={<TicketsPage />} />
        </Route>

        {/* ─── ZONA SUPERVISOR ─── */}
        <Route path="/supervisor" element={<MainLayout role="SUPERVISOR" />}>
          {/* El Dashboard suele ser la página principal (index) */}
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
