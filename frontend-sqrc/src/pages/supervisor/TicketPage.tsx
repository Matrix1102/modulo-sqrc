import { AgentList } from "../../features/tickets/components/AgentList";
import { TicketTable } from "../../features/tickets/components/TicketTable";

// Datos Dummy para la vista general (Tickets recientes de todo el equipo)
const recentTickets = Array(7).fill({
  id: "SQR-100236",
  client: "Andre Melendez",
  motive: "Cobro doble",
  date: "31/10/2025",
  status: "ABIERTO",
});

const TicketPage = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. HEADER DE LA PÁGINA */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Ticketing
        </h1>
        <p className="text-gray-500 font-medium">
          Tickets relacionados a los agentes de tu equipo
        </p>
      </div>

      {/* 2. GRID PRINCIPAL (Layout Asimétrico) */}
      {/* min-h-0 es vital para que el scroll interno de las listas funcione bien dentro de flex */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* COLUMNA IZQUIERDA (1/3): Lista de Agentes */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <AgentList />
        </div>

        {/* COLUMNA DERECHA (2/3): Tabla de Tickets Recientes */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <TicketTable
            tickets={recentTickets}
            title="Tickets con interacción reciente"
            showToolbar={true} // Mostramos el buscador general
          />
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
