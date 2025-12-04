import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2, Star, Send } from "lucide-react";
import http from "../../services/http";

interface Opcion {
  idOpcion: number;
  texto: string;
  orden: number;
}

interface Pregunta {
  idPregunta: number;
  texto: string;
  tipo: "RADIO" | "BOOLEANA" | "TEXTO";
  obligatoria: boolean;
  orden: number;
  esCalificacion: boolean;
  opciones?: Opcion[];
}

interface EncuestaData {
  idEncuesta: number;
  plantillaNombre: string;
  plantillaDescripcion?: string;
  estado: string;
  preguntas: Pregunta[];
  agenteNombre?: string;
  alcanceEvaluacion?: string;
}

type RespuestaValue = string | number | null;

/**
 * Página pública para que el cliente responda una encuesta.
 * Accesible desde: /encuestas/exec/:encuestaId
 */
export default function SurveyExecutionPage() {
  const { encuestaId } = useParams<{ encuestaId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encuesta, setEncuesta] = useState<EncuestaData | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, RespuestaValue>>({});
  const [submitted, setSubmitted] = useState(false);

  // Cargar datos de la encuesta
  useEffect(() => {
    const fetchEncuesta = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener encuesta con sus preguntas
        const response = await http.get(`/api/encuestas/${encuestaId}/ejecutar`);
        const data = response.data;
        
        if (data.estado === "RESPONDIDA") {
          setError("Esta encuesta ya fue respondida. ¡Gracias por su participación!");
          return;
        }
        
        if (data.estado === "EXPIRADA") {
          setError("Esta encuesta ha expirado y ya no está disponible.");
          return;
        }
        
        setEncuesta(data);
        
        // Inicializar respuestas vacías
        const initialRespuestas: Record<number, RespuestaValue> = {};
        data.preguntas?.forEach((p: Pregunta) => {
          initialRespuestas[p.idPregunta] = null;
        });
        setRespuestas(initialRespuestas);
        
      } catch (err: any) {
        console.error("Error cargando encuesta:", err);
        if (err.response?.status === 404) {
          setError("La encuesta solicitada no existe.");
        } else {
          setError("Error al cargar la encuesta. Por favor, intente más tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (encuestaId) {
      fetchEncuesta();
    }
  }, [encuestaId]);

  // Manejar cambio de respuesta
  const handleRespuestaChange = (preguntaId: number, valor: RespuestaValue) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  // Validar que todas las preguntas obligatorias estén respondidas
  const validarRespuestas = (): boolean => {
    if (!encuesta) return false;
    
    for (const pregunta of encuesta.preguntas) {
      if (pregunta.obligatoria) {
        const respuesta = respuestas[pregunta.idPregunta];
        if (respuesta === null || respuesta === "" || respuesta === undefined) {
          return false;
        }
      }
    }
    return true;
  };

  // Enviar respuestas
  const handleSubmit = async () => {
    if (!encuesta || !validarRespuestas()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Construir payload
      const payload = {
        idEncuesta: encuesta.idEncuesta,
        respuestas: Object.entries(respuestas)
          .filter(([_, valor]) => valor !== null && valor !== "")
          .map(([idPregunta, valor]) => ({
            idPregunta: parseInt(idPregunta),
            valor: String(valor)
          }))
      };

      await http.post("/api/encuestas/responder", payload);
      setSubmitted(true);
      
    } catch (err: any) {
      console.error("Error enviando respuestas:", err);
      setError(err.response?.data?.message || "Error al enviar las respuestas. Por favor, intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar pregunta según su tipo
  const renderPregunta = (pregunta: Pregunta, index: number) => {
    const valor = respuestas[pregunta.idPregunta];
    const isCalificacion = pregunta.esCalificacion;

    return (
      <div 
        key={pregunta.idPregunta} 
        className={`bg-white rounded-xl shadow-sm border ${isCalificacion ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'} overflow-hidden`}
      >
        {/* Header de la pregunta */}
        <div className={`px-5 py-4 ${isCalificacion ? 'bg-yellow-500' : 'bg-blue-600'} text-white`}>
          <div className="flex items-start gap-3">
            <span className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium leading-tight">{pregunta.texto}</p>
              {pregunta.obligatoria && (
                <span className="text-xs opacity-80 mt-1 inline-block">* Obligatoria</span>
              )}
              {isCalificacion && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2">
                  ⭐ Calificación general
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cuerpo con opciones de respuesta */}
        <div className="p-5">
          {pregunta.tipo === "RADIO" && pregunta.opciones && (
            <div className={`grid ${isCalificacion ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
              {pregunta.opciones
                .sort((a, b) => a.orden - b.orden)
                .map((opcion) => (
                  <label
                    key={opcion.idOpcion}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${valor === String(opcion.idOpcion) 
                        ? isCalificacion 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.idPregunta}`}
                      value={opcion.idOpcion}
                      checked={valor === String(opcion.idOpcion)}
                      onChange={() => handleRespuestaChange(pregunta.idPregunta, String(opcion.idOpcion))}
                      className="sr-only"
                    />
                    {isCalificacion ? (
                      <div className="flex flex-col items-center gap-1 w-full">
                        <Star 
                          className={`w-8 h-8 ${valor === String(opcion.idOpcion) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                        <span className="text-xs text-gray-600 text-center">{opcion.texto}</span>
                      </div>
                    ) : (
                      <>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                          ${valor === String(opcion.idOpcion) ? 'border-blue-500' : 'border-gray-300'}`}>
                          {valor === String(opcion.idOpcion) && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="text-gray-700">{opcion.texto}</span>
                      </>
                    )}
                  </label>
                ))}
            </div>
          )}

          {pregunta.tipo === "BOOLEANA" && (
            <div className="flex gap-4">
              {[
                { value: "true", label: "Sí", emoji: "👍" },
                { value: "false", label: "No", emoji: "👎" }
              ].map((opcion) => (
                <label
                  key={opcion.value}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${valor === opcion.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name={`pregunta-${pregunta.idPregunta}`}
                    value={opcion.value}
                    checked={valor === opcion.value}
                    onChange={() => handleRespuestaChange(pregunta.idPregunta, opcion.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{opcion.emoji}</span>
                  <span className="font-medium text-gray-700">{opcion.label}</span>
                </label>
              ))}
            </div>
          )}

          {pregunta.tipo === "TEXTO" && (
            <textarea
              value={valor as string || ""}
              onChange={(e) => handleRespuestaChange(pregunta.idPregunta, e.target.value)}
              placeholder="Escriba su respuesta aquí..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            />
          )}
        </div>
      </div>
    );
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Cargando encuesta...</h2>
          <p className="text-gray-500 mt-2">Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Aviso</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Estado de enviado exitosamente
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias por su respuesta!</h2>
          <p className="text-gray-600 mb-6">
            Su opinión es muy importante para nosotros y nos ayuda a mejorar continuamente.
          </p>
          <div className="text-sm text-gray-400">
            Puede cerrar esta ventana
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  if (!encuesta) return null;

  const isValid = validarRespuestas();
  const preguntasOrdenadas = [...encuesta.preguntas].sort((a, b) => {
    // Poner la pregunta de calificación al final
    if (a.esCalificacion && !b.esCalificacion) return 1;
    if (!a.esCalificacion && b.esCalificacion) return -1;
    return a.orden - b.orden;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">{encuesta.plantillaNombre}</h1>
            {encuesta.plantillaDescripcion && (
              <p className="text-blue-100">{encuesta.plantillaDescripcion}</p>
            )}
            {encuesta.agenteNombre && encuesta.alcanceEvaluacion === "AGENTE" && (
              <div className="mt-4 bg-white/10 rounded-lg px-4 py-2 inline-block">
                <span className="text-sm">Evaluando a: </span>
                <span className="font-semibold">{encuesta.agenteNombre}</span>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
            <p className="text-sm text-blue-700">
              Por favor responda las siguientes preguntas. Las marcadas con * son obligatorias.
            </p>
          </div>
        </div>

        {/* Preguntas */}
        <div className="space-y-4 mb-6">
          {preguntasOrdenadas.map((pregunta, index) => renderPregunta(pregunta, index))}
        </div>

        {/* Botón Enviar */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
              ${isValid && !submitting
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Respuestas
              </>
            )}
          </button>
          {!isValid && (
            <p className="text-center text-sm text-amber-600 mt-3">
              Por favor responda todas las preguntas obligatorias
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Sistema SQRC - Encuestas de Satisfacción</p>
        </div>
      </div>
    </div>
  );
}
