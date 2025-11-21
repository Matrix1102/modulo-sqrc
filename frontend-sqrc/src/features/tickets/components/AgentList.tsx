// src/features/tickets/components/AgentList.tsx
import { Search } from "lucide-react";

// Datos dummy para probar
const agents = Array(6).fill({
  name: "Andre Melendez",
  tickets: 45,
  image: null, // Aquí iría la URL
});

export const AgentList = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Lista de Agentes</h3>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar agente..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Lista Scrolleable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {agents.map((agent, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                {agent.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.tickets} tickets</p>
              </div>
            </div>

            <button className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600">
              Ver tickets
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
