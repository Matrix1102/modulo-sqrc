import { AgentList } from "../../features/tickets/components/AgentList";
import { TicketTable } from "../../features/tickets/components/TicketTable";
import useAgentes from "../../features/reportes/hooks/useAgent";
import useRecentTickets from "../../features/tickets/hooks/useRecentTickets";
import { useNavigate } from "react-router-dom";

// Datos Dummy para referencia (ya usamos tickets reales via hook)

const TicketPage = () => {
  const { data: agentes, loading } = useAgentes();
  const navigate = useNavigate();

  const { tickets: recent, loading: recentLoading } = useRecentTickets(agentes, undefined, { maxItems: 25 });

  const handleViewTickets = (agenteId?: string) => {
    if (!agenteId) return;
    navigate(`/supervisor/tickets/agente/${agenteId}`);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 2. GRID PRINCIPAL (Layout Asimétrico) */}
      {/* min-h-0 es vital para que el scroll interno de las listas funcione bien dentro de flex */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* COLUMNA IZQUIERDA (1/3): Lista de Agentes */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <AgentList agents={agentes} loading={loading} onViewTickets={handleViewTickets} />
        </div>

        {/* COLUMNA DERECHA (2/3): Tabla de Tickets Recientes */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <TicketTable
            tickets={recent}
            loading={recentLoading || loading}
            title="Tickets con interacción reciente"
            showToolbar={true} // Mostramos el buscador general
          />
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
