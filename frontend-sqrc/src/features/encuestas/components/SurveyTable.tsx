"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge"; // ✅ Importación correcta del Badge

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

  // --- MOCK DATA (Datos de prueba) ---
  const mockData: SurveyResponse[] = [
    {
      id: 1,
      ticketId: "SQR-136",
      puntaje: 3.2, // Nota baja -> Amarillo
      comentario: "El agente fue muy amable y resolvió mi problema...",
      agenteName: type === "agents" ? "Andre Melendez" : undefined,
      tiempo: "Hace 5 min",
      clientEmail: "ivan.cava@gmail.com",
      responseDate: "25/12/2025, 1:34 pm",
      answers: [
        {
          id: 1,
          type: "RATING",
          question: "¿Cómo calificarías la atención?",
          answer: 3,
        },
        {
          id: 2,
          type: "BOOLEAN",
          question: "¿Se resolvió tu duda?",
          answer: "Sí",
        },
        {
          id: 3,
          type: "TEXT",
          question: "Comentarios adicionales",
          answer: "El tiempo de espera fue largo.",
        },
      ],
    },
    {
      id: 2,
      ticketId: "SQR-138",
      puntaje: 5.0, // Nota alta -> Verde
      comentario: "Excelente servicio.",
      agenteName: type === "agents" ? "Maria Garcia" : undefined,
      tiempo: "Hace 20 min",
      clientEmail: "juan.perez@gmail.com",
      responseDate: "25/12/2025, 1:15 pm",
      answers: [
        {
          id: 1,
          type: "RATING",
          question: "¿Cómo calificarías la atención?",
          answer: 5,
        },
        {
          id: 2,
          type: "BOOLEAN",
          question: "¿Se resolvió tu duda?",
          answer: "Sí",
        },
      ],
    },
  ];

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
            {mockData.map((item) => (
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
                    {item.agenteName}
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
