import React from "react";
import { Star } from "lucide-react";

interface Agent {
  name: string;
  tickets: number;
  rating: number;
  avatar?: string;
}

interface TopAgentsProps {
  agents?: Agent[];
  loading?: boolean;
}

export const TopAgents: React.FC<TopAgentsProps> = ({
  agents = [
    { name: "Andre Melendez", tickets: 45, rating: 4.8 },
    { name: "Maria Garcia", tickets: 41, rating: 4.5 },
    { name: "Carlos Rodriguez", tickets: 32, rating: 4.2 },
    { name: "Laura Martinez", tickets: 38, rating: 4.0 },
  ],
  loading = false,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-dark-900">
            Agentes mejor evaluados
          </h3>
          <p className="text-xs text-neutral-400">Top 4 agentes</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-4" role="status" aria-busy="true">
          {Array.from({ length: 4 }).map((_, idx) => {
            const nameWidth = [32, 28, 36, 30][idx % 4];
            const ticketsWidth = [12, 10, 14, 11][idx % 4];
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse ring-1 ring-gray-50" />
                  <div>
                    <div
                      className="h-4 bg-gray-100 rounded mb-1 animate-pulse"
                      style={{ width: `${nameWidth}ch` }}
                    ></div>
                    <div
                      className="h-3 bg-gray-100 rounded animate-pulse"
                      style={{ width: `${Math.max(8, nameWidth - 8)}ch` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 bg-gray-100 rounded animate-pulse"
                    style={{ width: `${ticketsWidth}ch` }}
                  />
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            );
          })}
        </div>
      ) : !agents || agents.length === 0 ? (
        <div className="py-8 text-sm text-dark-500">
          No hay listado de agentes
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(agent.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-dark-900">
                    {agent.name}
                  </p>
                  <p className="text-xs text-dark-500">
                    {agent.tickets} tickets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-dark-900">
                  {agent.rating}
                </span>
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
