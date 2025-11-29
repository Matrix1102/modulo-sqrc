import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import reportService from "../../reportes/services/reportService";

// --- 1. COMPONENTES VISUALES (Helpers) ---

const RatingDisplay = ({ value }: { value: number }) => (
  <div className="flex gap-3 justify-center">
    {[1, 2, 3, 4, 5].map((num) => (
      <div
        key={num}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          num === value
            ? "bg-blue-600 text-white ring-2 ring-blue-200 scale-110 shadow-md"
            : "bg-white text-gray-400 border border-gray-100"
        }`}
      >
        {num}
      </div>
    ))}
  </div>
);

const BooleanDisplay = ({ value }: { value: string }) => (
  <div className="flex gap-4 justify-center">
    <span
      className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${
        value === "Sí"
          ? "bg-blue-600 text-white shadow-md"
          : "bg-white text-gray-400 border border-gray-100"
      }`}
    >
      Sí
    </span>
    <span
      className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${
        value === "No"
          ? "bg-blue-600 text-white shadow-md"
          : "bg-white text-gray-400 border border-gray-100"
      }`}
    >
      No
    </span>
  </div>
);

// --- 2. COMPONENTE PRINCIPAL ---

interface SurveyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Puedes tiparlo mejor con tu interfaz SurveyResponse si quieres
}

export const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isOpen) return;
      // Si data ya contiene los resultados, usamos eso
      if (data && data.resultados) {
        setDetail(data);
        return;
      }

      // Si tenemos responseId, fetcheamos el detalle
      const responseId = data?.responseId || data?.id || data?.responseId;
      if (!responseId) {
        setDetail(data || null);
        return;
      }

      setLoading(true);
      try {
        const d = await reportService.fetchEncuestaDetalle(String(responseId));
        if (mounted) setDetail(d);
      } catch (err) {
        if (mounted) setDetail(data || null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      setDetail(null);
      setLoading(false);
    };
  }, [isOpen, data]);

  // Si no está abierto o no hay datos (ni detalle), no renderizamos nada
  if (!isOpen || (!data && !detail)) return null;

  // Protección contra undefined
  const answers = detail?.resultados || detail?.answers || data?.answers || [];

  return (
    /* --- OVERLAY (FONDO OSCURO) --- */
    /* Al hacer clic aquí, llamamos a onClose para cerrar el modal */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* --- CONTENEDOR DEL MODAL (BLANCO) --- */}
      {/* stopPropagation evita que el clic dentro del modal cierre el overlay */}
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
        >
          <X size={20} className="text-gray-500" />
        </button>
        {/* No mostrar botón Reenviar en el detalle de respuestas (son respuestas ya contestadas) */}

        {/* --- CONTENIDO SCROLLEABLE --- */}
        <div className="overflow-y-auto p-8">
          {/* Título */}
          <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-8">
            Detalle de la Encuesta
          </h2>

          {/* Sección de Metadatos (Caja Gris) */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              {loading ? (
                <>
                  <div>
                    <div className="h-3 bg-gray-100 rounded w-24 mb-2 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
                  </div>

                  <div className="sm:text-right">
                    <div className="h-3 bg-gray-100 rounded w-20 mb-2 animate-pulse ml-auto" />
                    <div className="h-5 bg-gray-200 rounded w-48 ml-auto animate-pulse" />
                  </div>

                  <div>
                    <div className="h-3 bg-gray-100 rounded w-16 mb-2 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>

                  <div className="sm:text-right">
                    <div className="h-3 bg-gray-100 rounded w-24 mb-2 animate-pulse ml-auto" />
                    <div className="h-5 bg-gray-200 rounded w-36 ml-auto animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Ticket
                    </span>
                    <span className="font-bold text-gray-800 text-lg">
                      {detail?.ticketId || data.ticketId}
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Cliente
                    </span>
                    <span className="font-medium text-gray-700">
                      {detail?.clientEmail || data.clientEmail}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Agente
                    </span>
                    <span className="font-medium text-gray-700">
                      {detail?.agenteName || data.agenteName || "N/A"}
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Fecha Respuesta
                    </span>
                    <span className="font-medium text-gray-700">
                      {detail?.fechaRespuesta ||
                        detail?.responseDate ||
                        data.responseDate}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-center text-gray-800 mb-6">
            Resultados de la Encuesta
          </h3>

          {/* Lista de Preguntas */}
          <div className="space-y-6">
            {loading ? (
              // show 4 skeleton question cards
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-3 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-5/6 animate-pulse" />
                </div>
              ))
            ) : (
              answers.map((resp: any, idx: number) => (
                <QuestionCard
                  key={idx}
                  index={idx + 1}
                  questionText={resp.question}
                >
                  {/* Renderizado Condicional según el tipo de respuesta */}

                  {resp.type === "RATING" && (
                    <RatingDisplay value={Number(resp.answer)} />
                  )}

                  {resp.type === "BOOLEAN" && (
                    <BooleanDisplay value={resp.answer} />
                  )}

                  {resp.type === "TEXT" && (
                    <p className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed italic shadow-sm">
                      "{resp.answer}"
                    </p>
                  )}
                </QuestionCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
