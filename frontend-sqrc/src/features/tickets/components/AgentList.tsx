// src/features/tickets/components/AgentList.tsx
import { useMemo, useState } from "react";
import type { AgenteDetail } from "../../reportes/types/reporte";
import SearchBar from "../../../components/ui/SearchBar";

interface AgentListProps {
  agents?: AgenteDetail[] | null;
  loading?: boolean;
  onViewTickets?: (agenteId: string) => void;
}

export const AgentList: React.FC<AgentListProps> = ({ agents, loading, onViewTickets }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!agents) return [];
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => {
      return (
        (a.nombre || "").toLowerCase().includes(q) ||
        String(a.agenteId || "").toLowerCase().includes(q)
      );
    });
  }, [agents, query]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Lista de Agentes</h3>

      {/* Buscador */}
      <div className="relative mb-6">
        <SearchBar value={query} onChange={(q) => setQuery(q)} placeholder="Buscar agente..." />
      </div>

      {/* Lista Scrolleable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {loading ? (
          <div role="status" aria-busy="true" className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                  <div>
                    <div className="h-4 bg-gray-100 rounded w-36 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-dark-500">No hay listado de agentes</div>
        ) : (
          filtered.map((agent, idx) => (
            <div key={agent.agenteId ?? idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                  {agent.nombre ? agent.nombre.charAt(0) : "A"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{agent.nombre}</p>
                  <p className="text-xs text-gray-500">{agent.volumenTotalAtendido ?? 0} tickets</p>
                </div>
              </div>

              <button onClick={() => onViewTickets?.(agent.agenteId)} className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-600">
                Ver tickets
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
