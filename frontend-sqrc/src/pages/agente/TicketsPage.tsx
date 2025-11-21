import { AgentList } from "../../features/tickets/components/AgentList";
import { TicketTable } from "../../features/tickets/components/TicketTable";

const TicketingPage = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header de la Página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ticketing</h1>
        <p className="text-gray-500">
          Tickets relacionados a los agentes de tu equipo
        </p>
      </div>

      {/* Grid Principal - Altura calculada para que ocupe el resto de la pantalla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Columna Izquierda (1/3) */}
        <div className="lg:col-span-1 h-full">
          <AgentList />
        </div>

        {/* Columna Derecha (2/3) */}
        <div className="lg:col-span-2 h-full">
          <TicketTable />
        </div>
      </div>
    </div>
  );
};

export default TicketingPage;
