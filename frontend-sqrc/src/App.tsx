import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import TicketingPage from "./pages/agente/TicketsPage";
import Vista360Page from "./pages/agente/Vista360";
import TicketPage from "./pages/supervisor/TicketPage";
import SupervisorTicketDetailPage from "./pages/supervisor/TicketDetailPage";
import TicketAgentPage from "./pages/supervisor/TicketAgentPage";
import DashboardPage from "./pages/supervisor/DashboardPage";
import EncuestasPage from "./pages/supervisor/SurveyPage";
import SurveyCategoryPage from "./pages/supervisor/SurveyCategoryPage";
import SurveyExecutionPage from "./pages/public/SurveyExecutionPage";
import SimuladorAreaExterna from "./pages/public/SimuladorAreaExterna";
import { ResponderTicketPage } from "./features/plantilla_respuestas/pages/ResponderTicketPage";

// Tickets Feature - Pages
import { TicketDetailPage as AgenteTicketDetailPage, CallSimulatorProvider } from "./features/tickets";

// Base de Conocimiento
import {
  BaseConocimientoPage,
  BackofficeBaseConocimientoPage,
  SupervisorBaseConocimientoPage,
  ArticuloExpandidoPage,
  EditarArticuloPage,
} from "./features/baseConocimiento";

// plantillas de respuestas
import { PlantillasDashboard } from "./features/plantilla_respuestas/pages/PlantillasDashboard";
import HistorialRespuestasPage from "./features/plantilla_respuestas/pages/HistorialRespuestasPage"

// Contexto de Usuario
import { UserProvider } from "./context";

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

    <div className="grid grid-cols-2 gap-4 max-w-lg">
      {/* Agente de Llamada */}
      <Link
        to="/agente-llamada"
        className="px-6 py-5 bg-sqrc-gray-800 hover:bg-sqrc-gray-700 border border-sqrc-gray-700 text-white rounded-xl transition-all font-medium flex flex-col items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <span className="text-3xl">📞</span>
        <div className="text-center">
          <span className="block font-semibold">Agente Llamada</span>
          <span className="text-xs text-sqrc-gray-400">Call Center</span>
        </div>
      </Link>

      {/* Agente Presencial */}
      <Link
        to="/agente-presencial"
        className="px-6 py-5 bg-sqrc-gray-800 hover:bg-sqrc-gray-700 border border-sqrc-gray-700 text-white rounded-xl transition-all font-medium flex flex-col items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <span className="text-3xl">🏢</span>
        <div className="text-center">
          <span className="block font-semibold">Agente Presencial</span>
          <span className="text-xs text-sqrc-gray-400">
            Atención en oficina
          </span>
        </div>
      </Link>

      {/* Backoffice */}
      <Link
        to="/backoffice"
        className="px-6 py-5 bg-sqrc-gray-800 hover:bg-sqrc-gray-700 border border-sqrc-gray-700 text-white rounded-xl transition-all font-medium flex flex-col items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <span className="text-3xl">💼</span>
        <div className="text-center">
          <span className="block font-semibold">Backoffice</span>
          <span className="text-xs text-sqrc-gray-400">Gestión interna</span>
        </div>
      </Link>

      {/* Supervisor */}
      <Link
        to="/supervisor"
        className="px-6 py-5 bg-sqrc-gray-800 hover:bg-sqrc-gray-700 border border-sqrc-gray-700 text-white rounded-xl transition-all font-medium flex flex-col items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <span className="text-3xl">👑</span>
        <div className="text-center">
          <span className="block font-semibold">Supervisor</span>
          <span className="text-xs text-sqrc-gray-400">Panel de control</span>
        </div>
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <UserProvider>
      <CallSimulatorProvider>
        <BrowserRouter>
          <Routes>
          {/* Ruta Pública (Inicio) */}
          <Route path="/" element={<Home />} />

          {/* ─── ENCUESTA PÚBLICA (Cliente responde) ─── */}
          <Route
            path="/encuestas/exec/:encuestaId"
            element={<SurveyExecutionPage />}
          />

          {/* ─── SIMULADOR DE ÁREA EXTERNA (Público) ─── */}
          <Route
            path="/simulador-area-externa"
            element={<SimuladorAreaExterna />}
          />

          {/* ─── ZONA AGENTE LLAMADA ─── */}
          <Route
            path="/agente-llamada"
            element={<MainLayout role="AGENTE_LLAMADA" />}
          >
            <Route index element={<TicketingPage />} />
            <Route path="tickets" element={<TicketingPage />} />
            <Route
              path="tickets/:ticketId"
              element={<AgenteTicketDetailPage />}
            />
            <Route
              path="tickets/responder/:ticketId"
              element={<ResponderTicketPage />}
            />
          </Route>

          {/* ─── ZONA AGENTE PRESENCIAL ─── */}
          <Route
            path="/agente-presencial"
            element={<MainLayout role="AGENTE_PRESENCIAL" />}
          >
            <Route index element={<TicketingPage />} />
            <Route path="tickets" element={<TicketingPage />} />
            <Route
              path="tickets/:ticketId"
              element={<AgenteTicketDetailPage />}
            />
            <Route
              path="tickets/responder/:ticketId"
              element={<ResponderTicketPage />}
            />
          </Route>

          {/* Vista 360 del cliente - Agente Llamada */}
          <Route
            path="/agente-llamada/cliente-360"
            element={<MainLayout role="AGENTE_LLAMADA" />}
          >
            <Route index element={<Vista360Page />} />
          </Route>

          {/* Vista 360 del cliente - Agente Presencial */}
          <Route
            path="/agente-presencial/cliente-360"
            element={<MainLayout role="AGENTE_PRESENCIAL" />}
          >
            <Route index element={<Vista360Page />} />
          </Route>

          {/* ─── ZONA BACKOFFICE ─── */}
          <Route path="/backoffice" element={<MainLayout role="BACKOFFICE" />}>
            <Route index element={<TicketingPage />} />
            <Route path="tickets" element={<TicketingPage />} />
            <Route
              path="tickets/:ticketId"
              element={<AgenteTicketDetailPage />}
            />
          </Route>

          {/* ─── ZONA SUPERVISOR ─── */}
          <Route path="/supervisor" element={<MainLayout role="SUPERVISOR" />}>
            {/* El Dashboard suele ser la página principal (index) */}
            <Route index element={<DashboardPage />} />
            {/*  Ruta de Gestión de Plantillas */}
            <Route path="plantillas" element={<PlantillasDashboard />} />
            {/* --- ruta tabla de repsuestas --- */}
            <Route path="historial-respuestas" element={<HistorialRespuestasPage />} />
            {/* ----------------------- */}
            <Route path="encuestas" element={<EncuestasPage />} />
            <Route
              path="encuestas/agentes"
              element={<SurveyCategoryPage category="AGENTE" />}
            />
            <Route
              path="encuestas/servicios"
              element={<SurveyCategoryPage category="SERVICIO" />}
            />
            <Route path="tickets" element={<TicketPage />} />
            <Route
              path="tickets/agente/:agenteId"
              element={<TicketAgentPage />}
            />
            <Route
              path="tickets/detalle/:ticketId"
              element={<SupervisorTicketDetailPage />}
            />
          </Route>

          {/* ─── BASE DE CONOCIMIENTO - Por rol ─── */}
          <Route
            path="/agente-llamada/base-conocimiento"
            element={<MainLayout role="AGENTE_LLAMADA" />}
          >
            <Route index element={<BaseConocimientoPage />} />
            <Route path="articulo/:id" element={<ArticuloExpandidoPage />} />
            <Route path="editar/:id" element={<EditarArticuloPage />} />
          </Route>

          <Route
            path="/agente-presencial/base-conocimiento"
            element={<MainLayout role="AGENTE_PRESENCIAL" />}
          >
            <Route index element={<BaseConocimientoPage />} />
            <Route path="articulo/:id" element={<ArticuloExpandidoPage />} />
            <Route path="editar/:id" element={<EditarArticuloPage />} />
          </Route>

          <Route
            path="/backoffice/base-conocimiento"
            element={<MainLayout role="BACKOFFICE" />}
          >
            <Route index element={<BackofficeBaseConocimientoPage />} />
            <Route path="articulo/:id" element={<ArticuloExpandidoPage />} />
          </Route>

          {/* ─── BASE DE CONOCIMIENTO - SUPERVISOR ─── */}
          <Route
            path="/supervisor/base-conocimiento"
            element={<MainLayout role="SUPERVISOR" />}
          >
            <Route index element={<SupervisorBaseConocimientoPage />} />
            <Route path="articulo/:id" element={<ArticuloExpandidoPage />} />
            <Route path="editar/:id" element={<EditarArticuloPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CallSimulatorProvider>
    </UserProvider>
  );
}
