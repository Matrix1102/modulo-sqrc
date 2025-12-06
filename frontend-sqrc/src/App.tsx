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
  <div className="min-h-screen flex flex-col items-center justify-center bg-light-100 text-dark-900 gap-8 p-6">
    <div className="text-center mb-4">
      <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent drop-shadow-lg">
        Sistema SQRC
      </h1>
      <p className="text-light-600 text-lg">
        Selecciona tu perfil para continuar
      </p>
    </div>

    <div className="grid grid-cols-2 gap-5 max-w-xl w-full">
      {/* Agente de Llamada */}
      <Link
        to="/agente-llamada"
        className="group relative px-6 py-6 bg-white hover:bg-light-50 border border-light-300 hover:border-primary-500 text-dark-900 rounded-xl transition-all duration-300 font-medium flex flex-col items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-primary-500/10 hover:scale-[1.03]"
      >
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📞</span>
        <div className="text-center">
          <span className="block font-semibold text-lg">Agente Llamada</span>
          <span className="text-sm text-light-600 group-hover:text-light-700">Call Center</span>
        </div>
      </Link>

      {/* Agente Presencial */}
      <Link
        to="/agente-presencial"
        className="group relative px-6 py-6 bg-white hover:bg-light-50 border border-light-300 hover:border-success-500 text-dark-900 rounded-xl transition-all duration-300 font-medium flex flex-col items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-success-500/10 hover:scale-[1.03]"
      >
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏢</span>
        <div className="text-center">
          <span className="block font-semibold text-lg">Agente Presencial</span>
          <span className="text-sm text-light-600 group-hover:text-light-700">Atención en oficina</span>
        </div>
      </Link>

      {/* Backoffice */}
      <Link
        to="/backoffice"
        className="group relative px-6 py-6 bg-white hover:bg-light-50 border border-light-300 hover:border-neutral-400 text-dark-900 rounded-xl transition-all duration-300 font-medium flex flex-col items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-neutral-400/10 hover:scale-[1.03]"
      >
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">💼</span>
        <div className="text-center">
          <span className="block font-semibold text-lg">Backoffice</span>
          <span className="text-sm text-light-600 group-hover:text-light-700">Gestión interna</span>
        </div>
      </Link>

      {/* Supervisor */}
      <Link
        to="/supervisor"
        className="group relative px-6 py-6 bg-white hover:bg-light-50 border border-light-300 hover:border-primary-600 text-dark-900 rounded-xl transition-all duration-300 font-medium flex flex-col items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-primary-600/10 hover:scale-[1.03]"
      >
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">👑</span>
        <div className="text-center">
          <span className="block font-semibold text-lg">Supervisor</span>
          <span className="text-sm text-light-600 group-hover:text-light-700">Panel de control</span>
        </div>
      </Link>
    </div>

    <p className="text-light-500 text-xs mt-4">
      © 2025 SQRC — Sistema de Gestión de Calidad
    </p>
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

          {/* ─── ZONA AGENTE LLAMADA ─── */}
          <Route
            path="/agente-llamada"
            element={<MainLayout role="AGENTE_LLAMADA" />}
          >
            <Route index element={<TicketingPage key="agente-llamada" />} />
            <Route path="tickets" element={<TicketingPage key="agente-llamada-tickets" />} />
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
            <Route index element={<TicketingPage key="agente-presencial" />} />
            <Route path="tickets" element={<TicketingPage key="agente-presencial-tickets" />} />
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
            <Route index element={<TicketingPage key="backoffice" />} />
            <Route path="tickets" element={<TicketingPage key="backoffice-tickets" />} />
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