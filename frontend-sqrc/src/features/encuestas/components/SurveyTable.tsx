"use client";
import React from "react";

interface SurveyResponse {
  id: number;
  ticketId: string;
  puntaje: number;
  comentario: string;
  agenteName?: string;
  tiempo: string;
  // Datos para el modal
  clientEmail: string;
  responseDate: string;
  answers: any[]; // Puedes usar un tipo más específico si lo tienes
}

interface SurveyTableProps {
  type: "agents" | "services";
  onViewDetail?: (data: SurveyResponse) => void;
}

export const SurveyTable: React.FC<SurveyTableProps> = ({
  type,
  onViewDetail,
}) => {
  const title =
    type === "agents"
      ? "Respuestas recientes de encuestas sobre agentes"
      : "Respuestas recientes de encuestas sobre servicios";

  // Mock Data (simulando respuestas de API)
  const responses: SurveyResponse[] = [
    {
      id: 1,
      ticketId: "SQR-136",
      puntaje: 3.2,
      comentario: "El agente fue muy amable y resolvió mi problema de...",
      agenteName: type === "agents" ? "Andre Melendez" : undefined,
      tiempo: "Hace 5 min",
      clientEmail: "ivan.cava@gmail.com",
      responseDate: "25/12/2025, 1:34 pm",
      answers: [
        {
          id: 1,
          type: "RATING",
          question: "¿Cómo calificarías...?",
          answer: 3,
        },
        { id: 2, type: "BOOLEAN", question: "¿Se resolvió...?", answer: "Sí" },
      ],
    },
    // Puedes agregar más items aquí...
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                Ticket
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                Puntuac.
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 pb-3 w-1/3">
                Comentario
              </th>
              {type === "agents" && (
                <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                  Agente
                </th>
              )}
              <th className="text-right text-xs font-semibold text-gray-600 pb-3">
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => (
              <tr
                key={index}
                onClick={() => onViewDetail && onViewDetail(response)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
              >
                <td className="py-4 align-top">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-lg inline-block shadow-sm">
                    {response.ticketId}
                  </span>
                </td>
                <td className="py-4 align-top">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      response.puntaje >= 4
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {response.puntaje}/5
                  </span>
                </td>
                <td className="py-4 text-sm text-gray-600 pr-4">
                  <p className="line-clamp-2">{response.comentario}</p>
                </td>
                {type === "agents" && (
                  <td className="py-4 text-sm font-medium text-gray-800 align-top whitespace-nowrap">
                    {response.agenteName}
                  </td>
                )}
                <td className="py-4 text-sm text-gray-400 align-top text-right whitespace-nowrap">
                  {response.tiempo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98]">
          Ver todos
        </button>
      </div>
    </div>
  );
};
