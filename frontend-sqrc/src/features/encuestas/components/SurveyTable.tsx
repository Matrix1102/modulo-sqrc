"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge"; // ✅ Importación correcta del Badge
import useEncuestaRespuestas from "../hooks/useEncuestaRespuestas";

// Definición exportada para que otros componentes (como el Modal) la usen
export interface SurveyResponse {
  id: number;
  ticketId: string;
  puntaje: number;
  comentario: string;
  agenteName?: string;
  tiempo: string;
  clientEmail: string;
  responseDate: string;
  answers: {
    id: number;
    type: string;
    question: string;
    answer: any;
  }[];
}

interface SurveyTableProps {
  type: "agents" | "services";
  onViewDetail?: (data: SurveyResponse) => void;
  showViewAll?: boolean;
}

export const SurveyTable: React.FC<SurveyTableProps> = ({
  type,
  onViewDetail,
  showViewAll = true,
}) => {
  const navigate = useNavigate();

  const title =
    type === "agents"
      ? "Respuestas recientes de encuestas sobre agentes"
      : "Respuestas recientes de encuestas sobre servicios";

  // Helper para elegir el color del Badge según el puntaje
  const getScoreVariant = (score: number) => {
    if (score >= 4.5) return "success"; // Verde (Excelente)
    if (score >= 3) return "warning"; // Amarillo (Regular)
    return "danger"; // Rojo (Malo)
  };

  // Fetch recent responses from backend (limit N)
  const { data: responses, loading } = useEncuestaRespuestas({
    alcanceEvaluacion: type === "agents" ? "AGENTE" : "SERVICIO",
    limit: 6,
  });

  // Map backend response shape to SurveyResponse-friendly fields
  const rows: SurveyResponse[] = (responses || []).map((r: any, idx: number) => ({
    id: idx + 1,
    ticketId: r.ticketId || `T-${r.responseId || idx}`,
    puntaje: typeof r.puntaje === "number" ? r.puntaje : (parseFloat(r.puntaje) || 0),
    comentario: r.comentario || "",
    agenteName: r.agenteName || (type === "agents" ? undefined : undefined),
    tiempo: r.tiempo || "",
    clientEmail: r.clientEmail || "",
    responseDate: r.fechaRespuesta || "",
    answers: r.resultados || [],
  }));

  const handleViewAll = () => {
    const path =
      type === "agents"
        ? "/supervisor/encuestas/agentes"
        : "/supervisor/encuestas/servicios";
    navigate(path);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-all hover:shadow-md">
      {/* Título */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-xs font-semibold text-gray-500 pb-3 pl-2">
                Ticket
              </th>
              <th className="text-xs font-semibold text-gray-500 pb-3">
                Puntuac.
              </th>
              <th className="text-xs font-semibold text-gray-500 pb-3 w-1/3">
                Comentario
              </th>
              {type === "agents" && (
                <th className="text-xs font-semibold text-gray-500 pb-3">
                  Agente
                </th>
              )}
              <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-2">
                Tiempo
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              // Skeleton rows while loading
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 pl-2 align-top">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                  </td>

                  <td className="py-4 align-top">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                  </td>

                  <td className="py-4 text-sm text-gray-600 pr-4">
                    <div className="h-8 bg-gray-100 rounded w-full" />
                  </td>

                  {type === "agents" && (
                    <td className="py-4 text-sm font-semibold text-gray-700 align-top whitespace-nowrap">
                      <div className="h-5 w-20 bg-gray-100 rounded" />
                    </td>
                  )}

                  <td className="py-4 text-xs text-gray-400 align-top text-right whitespace-nowrap pr-2 font-medium">
                    <div className="h-4 w-12 bg-gray-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={type === "agents" ? 5 : 4} className="p-8 text-center text-gray-400">
                  No hay respuestas recientes.
                </td>
              </tr>
            ) : rows.map((item) => (
              <tr
                key={item.id}
                onClick={() => onViewDetail && onViewDetail(item)}
                className="group cursor-pointer hover:bg-blue-50/40 transition-colors"
              >
                {/* Columna Ticket ID */}
                <td className="py-4 pl-2 align-top">
                  <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg inline-block shadow-sm group-hover:bg-blue-600 transition-colors">
                    {item.ticketId}
                  </span>
                </td>

                {/* Columna Puntuación (Usando Badge) */}
                <td className="py-4 align-top">
                  <Badge variant={getScoreVariant(item.puntaje)}>
                    {item.puntaje}/5
                  </Badge>
                </td>

                {/* Columna Comentario */}
                <td className="py-4 text-sm text-gray-600 pr-4">
                  <p className="line-clamp-2 leading-relaxed">
                    {item.comentario}
                  </p>
                </td>

                {/* Columna Agente (Condicional) */}
                {type === "agents" && (
                  <td className="py-4 text-sm font-semibold text-gray-700 align-top whitespace-nowrap">
                    {item.agenteName ?? "-"}
                  </td>
                )}

                {/* Columna Tiempo */}
                <td className="py-4 text-xs text-gray-400 align-top text-right whitespace-nowrap pr-2 font-medium">
                  {item.tiempo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón Ver Todos (Condicional) */}
      {showViewAll && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleViewAll}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
};
