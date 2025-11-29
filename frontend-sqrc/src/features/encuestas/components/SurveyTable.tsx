"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge"; // ✅ Importación correcta del Badge
import useEncuestaRespuestas from "../hooks/useEncuestaRespuestas";
import useEncuestas from "../hooks/useEncuestas";
import encuestaService from "../services/encuestaService";
import showToast from '../../../services/notification';
import showConfirm from '../../../services/confirm';

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
  encuestaId?: number | string;
  resendCount?: number;
  answers: {
    id: number;
    type: string;
    question: string;
    answer: any;
  }[];
}

interface SurveyTableProps {
  type: "agents" | "services";
  mode?: "recent" | "all" | "pending"; // recent = default responses recent, all = full responses, pending = encuestas ENVIADA
  onViewDetail?: (data: SurveyResponse) => void;
  showViewAll?: boolean;
}

export const SurveyTable: React.FC<SurveyTableProps> = ({
  type,
  mode = 'recent',
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

  // Fetch data depending on mode
  const { data: responses, loading: loadingResponses } = useEncuestaRespuestas({
    alcanceEvaluacion: type === "agents" ? "AGENTE" : "SERVICIO",
    limit: mode === 'recent' ? 6 : undefined,
  });

  const { data: encuestas, loading: loadingEncuestas, refetch: refetchEncuestas } = useEncuestas(mode === 'pending' ? { estado: 'ENVIADA' } : undefined);

  const loading = mode === 'pending' ? loadingEncuestas : loadingResponses;

  // Map backend response shape to SurveyResponse-friendly fields
  const rows: SurveyResponse[] = (mode === 'pending'
    ? (encuestas || []).map((e: any, idx: number) => ({
        id: idx + 1,
        // keep encuesta id available in ticketId as well as a separate metadata field when needed
        ticketId: e.ticketId || `T-${e.idEncuesta || idx}`,
        puntaje: 0,
        comentario: e.descripcion || '',
        agenteName: e.agenteName || undefined,
        tiempo: e.fechaEnvio || '',
        clientEmail: e.clientEmail || '',
        responseDate: e.fechaEnvio || '',
        answers: [],
        encuestaId: e.idEncuesta,
        resendCount: e.resendCount,
      }))
    : (responses || []).map((r: any, idx: number) => ({
        id: idx + 1,
        ticketId: r.ticketId || `T-${r.responseId || idx}`,
        puntaje: typeof r.puntaje === "number" ? r.puntaje : (parseFloat(r.puntaje) || 0),
        comentario: r.comentario || "",
        agenteName: r.agenteName || (type === "agents" ? undefined : undefined),
        tiempo: r.tiempo || "",
        clientEmail: r.clientEmail || "",
        responseDate: r.fechaRespuesta || "",
        answers: r.resultados || [],
      })));

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
              <th className="text-xs font-semibold text-gray-500 pb-3 pl-2 w-36">
                Ticket
              </th>
              <th className="text-xs font-semibold text-gray-500 pb-3 w-24">
                Puntuac.
              </th>
              <th className="text-xs font-semibold text-gray-500 pb-3 w-1/2">
                Comentario
              </th>
              {type === "agents" && (
                <th className="text-xs font-semibold text-gray-500 pb-3 w-36">
                  Agente
                </th>
              )}
              {mode === 'pending' && (
                <>
                  <th className="text-xs font-semibold text-gray-500 pb-3 w-24 text-center">Reenvíos</th>
                  <th className="text-xs font-semibold text-gray-500 pb-3 w-24 text-center">Acciones</th>
                </>
              )}
              <th className="text-right text-xs font-semibold text-gray-500 pb-3 pr-2 w-40">
                Tiempo
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              // Column-aligned skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {/* Ticket */}
                  <td className="py-4 pl-2 align-top w-36">
                    <div className="h-5 w-28 bg-gray-200 rounded" aria-hidden />
                  </td>

                  {/* Puntuación */}
                  <td className="py-4 align-top w-24">
                    <div className="h-5 w-16 bg-gray-200 rounded" aria-hidden />
                  </td>

                  {/* Comentario: two-line skeleton to match line-clamp-2 */}
                  <td className="py-4 text-sm text-gray-600 pr-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-full max-w-[560px]" aria-hidden />
                      <div className="h-4 bg-gray-100 rounded w-3/4 max-w-[420px]" aria-hidden />
                    </div>
                  </td>

                  {/* Agente (condicional) */}
                  {type === "agents" && (
                    <td className="py-4 text-sm font-semibold text-gray-700 align-top whitespace-nowrap w-36">
                      <div className="h-5 w-32 bg-gray-100 rounded" aria-hidden />
                    </td>
                  )}

                  {/* Reenvíos / Acciones (cuando aplica) */}
                  {mode === 'pending' && (
                    <>
                      <td className="py-4 text-sm text-gray-700 align-top text-center w-24">
                        <div className="h-5 w-10 bg-gray-100 rounded mx-auto" aria-hidden />
                      </td>
                      <td className="py-4 text-sm text-gray-700 align-top text-center w-24">
                        <div className="h-8 w-20 bg-gray-100 rounded mx-auto" aria-hidden />
                      </td>
                    </>
                  )}

                  {/* Tiempo */}
                  <td className="py-4 text-xs text-gray-400 align-top text-right whitespace-nowrap pr-2 font-medium w-40">
                    <div className="h-4 w-28 bg-gray-100 rounded ml-auto" aria-hidden />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={type === "agents" ? (mode === 'pending' ? 7 : 5) : (mode === 'pending' ? 6 : 4)} className="p-8 text-center text-gray-400">
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

                {mode === 'pending' && (
                  <>
                    <td className="py-4 text-sm text-gray-700 align-top text-center">{(item as any).resendCount ?? 0}</td>
                    <td className="py-4 text-xs text-gray-400 align-top text-center whitespace-nowrap pr-2 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const ok = await showConfirm('¿Deseas reenviar esta encuesta?', 'Reenviar');
                            if (!ok) return;
                            try {
                              await encuestaService.reenviarEncuesta((item as any).encuestaId);
                              showToast('Reenvío solicitado', 'success');
                              refetchEncuestas();
                            } catch (err) {
                              showToast('Error al solicitar reenvío', 'error');
                            }
                          }}
                          className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50"
                        >
                          Reenviar
                        </button>
                      </div>
                    </td>
                  </>
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
