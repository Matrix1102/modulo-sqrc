import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Filter, Plus, AlertCircle, Loader2 } from "lucide-react";
// 1. Importamos la Tabla Reutilizable
import { TicketTable } from "../../features/tickets/components/TicketTable";

interface TicketData {
  id: string;
  client: string;
  motive: string;
  date: string;
  status: string;
}

export default function TicketAgentPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [agentName, setAgentName] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      try {
        setTickets(
          Array(8).fill({
            id: "100236",
            client: "Andre Melendez",
            motive: "Cobro doble",
            date: "31/10/2025",
            status: "ABIERTO",
          })
        );
        setAgentName("Andre Melendez");
        setIsLoading(false);
      } catch (err) {
        setError("Error al cargar la información.");
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [agentId]);

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
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Ticket</h1>
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
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar tickets..."
            className="w-full pl-11 pr-4 py-3 bg-gray-200/60 border-none rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
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
          tickets={tickets}
          showToolbar={false} // 👈 Ocultamos el toolbar interno para usar el personalizado de arriba
          onRowClick={(id) => navigate(`/supervisor/ticketing/detalle/${id}`)}
        />
      </div>
    </div>
  );
}
