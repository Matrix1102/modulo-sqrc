"use client";
import React from "react";

interface SurveyResponse {
  ticket: string;
  rating: string;
  comment: string;
  agent?: string;
  time: string;
}

interface SurveyTableProps {
  type: "agents" | "services";
  responses?: SurveyResponse[];
}

export const SurveyTable: React.FC<SurveyTableProps> = ({
  type,
  responses = [
    {
      ticket: "SQR-136",
      rating: type === "agents" ? "3.2/5" : "3.3/5",
      comment: "El agente fue muy amable y resolvió mi problema de...",
      agent: type === "agents" ? "Andre Melen..." : undefined,
      time: "Hace 5 min",
    },
  ],
}) => {
  const title =
    type === "agents"
      ? "Respuestas recientes de encuestas sobre agentes"
      : "Respuestas recientes de encuestas sobre servicios";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="mb-6">
        <h3 className="text-base font-bold text-dark-900 mb-1">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left text-xs font-semibold text-dark-600 pb-3">
                Ticket
              </th>
              <th className="text-left text-xs font-semibold text-dark-600 pb-3">
                Puntuac.
              </th>
              <th className="text-left text-xs font-semibold text-dark-600 pb-3">
                Comentario
              </th>
              {type === "agents" && (
                <th className="text-left text-xs font-semibold text-dark-600 pb-3">
                  Agente
                </th>
              )}
              <th className="text-left text-xs font-semibold text-dark-600 pb-3">
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => (
              <tr
                key={index}
                onClick={() => console.log("Ver encuesta:", response.ticket)}
                className="border-b border-light-300 hover:bg-primary-50 cursor-pointer transition-colors"
              >
                <td className="py-4">
                  <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {response.ticket}
                  </span>
                </td>
                <td className="py-4">
                  <span className="bg-success-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {response.rating}
                  </span>
                </td>
                <td className="py-4 text-sm text-dark-700">
                  {response.comment}
                </td>
                {type === "agents" && (
                  <td className="py-4 text-sm text-dark-700">
                    {response.agent}
                  </td>
                )}
                <td className="py-4 text-sm text-dark-700">{response.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <button className="bg-primary-500 text-white px-24 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors">
          Ver todos
        </button>
      </div>
    </div>
  );
};
