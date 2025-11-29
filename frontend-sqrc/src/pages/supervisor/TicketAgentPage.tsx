import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Filter, Plus, AlertCircle, Loader2 } from "lucide-react";
// 1. Importamos la Tabla Reutilizable
import { TicketTable } from "../../features/tickets/components/TicketTable";
import reportService from "../../features/reportes/services/reportService";
import type { AgentTickets } from "../../features/reportes/types/reporte";
import SearchBar from "../../components/ui/SearchBar";

interface TicketData {
  id: string;
  client: string;
  motive: string;
  date: string;
  status: string;
}

export default function TicketAgentPage() {
  const { agenteId } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [agentName, setAgentName] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) =>
      [t.id, t.client, t.motive, t.status, t.date]
        .map((x) => String(x || "").toLowerCase())
        .some((s) => s.includes(q))
    );
  }, [tickets, query]);

  // --- FETCH DATA ---
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        if (!agenteId) throw new Error("Agente no especificado");
        const data: AgentTickets = await reportService.fetchTicketsByAgent(agenteId);
        if (!mounted) return;
        setAgentName(data.agenteNombre ?? "");
        // map to local TicketData shape if necessary
        setTickets(
          (data.tickets || []).map((t) => ({
            id: t.id,
            client: t.client,
            motive: t.motive,
            date: t.date,
            status: t.status,
          }))
        );
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Error al cargar la información.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [agenteId]);

  // --- LOADING / ERROR ---
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-pulse">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
        <p>Cargando tickets del equipo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 p-4 rounded-full mb-3">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <p className="text-gray-800 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-gray-500 font-medium">
            Tickets relacionados a{" "}
            <span className="text-gray-800 font-semibold">{agentName}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-800 underline text-sm font-medium transition-colors"
        >
          Volver
        </button>
      </div>

      {/* TOOLBAR PERSONALIZADO */}
      {/* Mantenemos este toolbar aquí porque tiene un estilo gris específico para esta página */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchBar value={query} onChange={(q) => setQuery(q)} placeholder="Buscar tickets..." />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-gray-200/60 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">
          <Filter size={16} /> Todos
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 shadow-md transition-all">
          <Plus size={18} strokeWidth={3} /> Ticket
        </button>
      </div>

      {/* TABLA REUTILIZABLE */}
      <div className="flex-1 min-h-0">
        {" "}
        {/* min-h-0 permite el scroll dentro de flex */}
        <TicketTable
          tickets={filtered}
          showToolbar={false} // 👈 Ocultamos el toolbar interno para usar el personalizado de arriba
          onRowClick={(id) => navigate(`/supervisor/ticketing/detalle/${id}`)}
        />
      </div>
    </div>
  );
}
