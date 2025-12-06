import { useState, useCallback } from "react";
import { TicketFilters } from "../../features/tickets/components/TicketFilters";
import { TicketListTable } from "../../features/tickets/components/TicketListTable";
import { ClienteAuthModal } from "../../features/tickets/components/ClienteAuthModal";
import { CreateTicketModal } from "../../features/tickets/components/CreateTicketModal";
import { useTickets } from "../../features/tickets/hooks/useTickets";
import { useCallSimulatorContext } from "../../features/tickets/hooks/useCallSimulatorContext";
import type { ClienteDTO, TicketFilters as ITicketFilters } from "../../features/tickets/types";

const TicketingPage = () => {
  // Estado para modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clienteAutenticado, setClienteAutenticado] = useState<ClienteDTO | null>(null);

  // Estado para filtros
  const [filters, setFilters] = useState<ITicketFilters>({});

  // Hook para obtener tickets
  const { tickets, loading, error, refetch } = useTickets(filters);

  // Obtener estado del simulador de llamadas desde el context
  const callSimulator = useCallSimulatorContext();
  const currentCall = callSimulator?.currentCall ?? null;
  const isActive = callSimulator?.isActive ?? false;

  // Handler para abrir el flujo de creación de ticket
  const handleOpenCreateFlow = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // Handler cuando el cliente es autenticado
  const handleClienteAutenticado = useCallback((cliente: ClienteDTO) => {
    setClienteAutenticado(cliente);
    setShowAuthModal(false);
    setShowCreateModal(true);
  }, []);

  // Handler cuando se cierra el modal de autenticación
  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setClienteAutenticado(null);
  }, []);

  // Handler cuando se crea el ticket exitosamente
  const handleTicketCreated = useCallback(() => {
    setShowCreateModal(false);
    setClienteAutenticado(null);
    refetch(); // Recargar la lista de tickets
  }, [refetch]);

  // Handler cuando se cierra el modal de creación
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setClienteAutenticado(null);
  }, []);

  // Handler para cambios en filtros
  const handleFiltersChange = useCallback((newFilters: ITicketFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header de la Página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ticketing</h1>
          <p className="text-gray-500">
            Gestiona y documenta los tickets de atención al cliente
          </p>
        </div>
        <button
          onClick={handleOpenCreateFlow}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Crear Ticket
        </button>
      </div>

      {/* Filtros */}
      <TicketFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Tabla de tickets */}
      <div className="flex-1 min-h-0 mt-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error al cargar tickets</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <TicketListTable tickets={tickets} loading={loading} />
      </div>

      {/* Modal de autenticación de cliente */}
      <ClienteAuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        onClienteAutenticado={handleClienteAutenticado}
      />

      {/* Modal de creación de ticket */}
      {clienteAutenticado && (
        <CreateTicketModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          cliente={clienteAutenticado}
          onTicketCreated={handleTicketCreated}
          activeLlamadaId={isActive ? currentCall?.idLlamada : null}
        />
      )}
    </div>
  );
};

export default TicketingPage;
