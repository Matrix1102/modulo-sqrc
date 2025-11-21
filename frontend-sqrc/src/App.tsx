import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import TicketingPage from "./pages/agente/TicketsPage";
import TicketPage from "./pages/supervisor/TicketPage";
import TicketDetailPage from "./pages/supervisor/TicketDetailPage";
import TicketAgentPage from "./pages/supervisor/TicketAgentPage";
import DashboardPage from "./pages/supervisor/DashboardPage";
import EncuestasPage from "./pages/supervisor/SurveyPage";

// Un Home temporal para que puedas navegar
const Home = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-sqrc-gray-900 text-sqrc-gray-100 gap-6">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2 text-sqrc-gray-100">
        Sistema SQRC
      </h1>
      <p className="text-sqrc-gray-400 text-lg">
        Selecciona tu perfil para continuar
      </p>
    </div>

    <div className="flex gap-4 flex-wrap justify-center">
      {/* Enlace directo a la página de Tickets del Agente */}
      <Link
        to="/agente/tickets"
        className="px-8 py-4 bg-sqrc-primary-500 hover:bg-sqrc-primary-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg"
      >
        🎧 Soy Agente
      </Link>

      {/* Enlace directo al Dashboard del Supervisor */}
      <Link
        to="/supervisor"
        className="px-8 py-4 bg-sqrc-secondary-500 hover:bg-sqrc-secondary-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg"
      >
        👑 Soy Supervisor
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
          <Route path="tickets" element={<TicketingPage />} />
        </Route>

        {/* ─── ZONA SUPERVISOR ─── */}
        <Route path="/supervisor" element={<MainLayout role="SUPERVISOR" />}>
          {/* El Dashboard suele ser la página principal (index) */}
          <Route index element={<DashboardPage />} />
          <Route path="encuestas" element={<EncuestasPage />} />
          <Route path="tickets" element={<TicketPage />} />
          <Route
            path="tickets/agente/:agenteId"
            element={<TicketAgentPage />}
          />
          <Route
            path="tickets/detalle/:ticketId"
            element={<TicketDetailPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
