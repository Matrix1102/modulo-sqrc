// Types
export * from "./types";

// Services
export { ticketApi } from "./services/ticketApi";
export * as llamadaApi from "./services/llamadaApi";

// Hooks
export { useTickets } from "./hooks/useTickets";
export { useTicketDetail } from "./hooks/useTicketDetail";
export { default as useRecentTickets } from "./hooks/useRecentTickets";
export { useCallSimulator } from "./hooks/useCallSimulator";
export { useCallSimulatorContext } from "./hooks/useCallSimulatorContext";

// Context
export { CallSimulatorProvider } from "./context/CallSimulatorProvider";

// Components
export { EstadoBadge } from "./components/EstadoBadge";
export { TipoBadge } from "./components/TipoBadge";
export { TicketFilters } from "./components/TicketFilters";
export { TicketListTable } from "./components/TicketListTable";
export { ClienteAuthModal } from "./components/ClienteAuthModal";
export { CreateTicketModal } from "./components/CreateTicketModal";
export { IncomingCallWidget } from "./components/IncomingCallWidget";

// Detail Components
export * from "./components/detail";

// Pages
export { TicketDetailPage } from "./pages/TicketDetailPage";
