import React, { useState } from "react";
import { Sparkles, X, Loader2, FileText, AlertCircle } from "lucide-react";
import articuloService from "../services/articuloService";
import showToast from "../../../services/notification";
import type { ArticuloGeneradoIA } from "../types/articulo";

interface GenerarArticuloIAModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCreador: number;
  onArticuloGenerado: (articulo: ArticuloGeneradoIA) => void;
}

const GenerarArticuloIAModal: React.FC<GenerarArticuloIAModalProps> = ({
  isOpen,
  onClose,
  idCreador,
  onArticuloGenerado,
}) => {
  const [idDocumentacion, setIdDocumentacion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerar = async () => {
    const docId = parseInt(idDocumentacion, 10);

    if (!idDocumentacion || isNaN(docId) || docId <= 0) {
      setError("Por favor ingresa un ID de documentación válido");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await articuloService.previewArticuloIA({
        idDocumentacion: docId,
        idCreador,
      });

      if (response.exito && response.contenidoGenerado) {
        showToast("✨ Artículo generado con IA exitosamente", "success");
        onArticuloGenerado(response.contenidoGenerado);
        handleClose();
      } else {
        setError(response.mensaje || "Error al generar el artículo");
        if (response.errores?.length) {
          setError(response.errores.join(", "));
        }
      }
    } catch (err: unknown) {
      console.error("Error al generar artículo con IA:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión con el servidor";
      setError(errorMessage);
      showToast("Error al generar artículo con IA", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIdDocumentacion("");
    setError(null);
    onClose();
  };

  // Generar al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && idDocumentacion && !loading) {
      handleGenerar();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Generar con IA
                </h2>
                <p className="text-purple-200 text-sm">
                  Gemini 2.5 Flash
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Ingresa el ID de documentación y la IA generará automáticamente
                el artículo con título, contenido estructurado, tags y categoría.
              </p>
            </div>
          </div>

          {/* ID Documentación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de Documentación
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ingresa el ID de documentación"
              value={idDocumentacion}
              onChange={(e) => setIdDocumentacion(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerar}
            disabled={loading || !idDocumentacion}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generar Artículo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerarArticuloIAModal;
