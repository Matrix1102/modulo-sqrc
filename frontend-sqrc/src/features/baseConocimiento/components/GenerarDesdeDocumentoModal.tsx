import React, { useState, useRef } from "react";
import { Sparkles, X, Loader2, Upload, AlertCircle, FileUp, Trash2 } from "lucide-react";
import articuloService from "../services/articuloService";
import showToast from "../../../services/notification";
import type { ArticuloGeneradoIA } from "../types/articulo";

interface GenerarDesdeDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCreador: number;
  onArticuloGenerado: (articulo: ArticuloGeneradoIA) => void;
  /** Título personalizado del modal (opcional) */
  titulo?: string;
  /** Subtítulo del modal (opcional) */
  subtitulo?: string;
  /** Mensaje informativo (opcional) */
  mensajeInfo?: string;
  /** Color del gradiente del header: 'purple' | 'green' | 'blue' */
  colorTema?: 'purple' | 'green' | 'blue';
}

/**
 * Modal para generar artículos con IA desde documentos subidos (PDF, Word, TXT).
 * Usa el patrón Strategy en el backend (DocumentoUploadStrategy).
 * 
 * Este componente es reutilizable y puede usarse en diferentes contextos
 * personalizando el título, mensaje y colores.
 */
const GenerarDesdeDocumentoModal: React.FC<GenerarDesdeDocumentoModalProps> = ({
  isOpen,
  onClose,
  idCreador,
  onArticuloGenerado,
  titulo = "Generar desde Documento",
  subtitulo = "Gemini 2.5 Flash",
  mensajeInfo = "Sube un documento PDF, Word o TXT y la IA extraerá el contenido para generar un artículo estructurado automáticamente.",
  colorTema = 'purple',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatos soportados
  const FORMATOS_SOPORTADOS = '.pdf,.doc,.docx,.txt';
  const FORMATOS_MIME = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

  // Colores según tema
  const colores = {
    purple: {
      gradient: 'from-purple-600 to-indigo-600',
      gradientHover: 'hover:from-purple-700 hover:to-indigo-700',
      shadow: 'shadow-purple-500/25',
      ring: 'focus:ring-purple-500',
      dropHover: 'hover:border-purple-400 hover:bg-purple-50',
      textAccent: 'text-purple-600',
      subtitleText: 'text-purple-200',
    },
    green: {
      gradient: 'from-green-600 to-emerald-600',
      gradientHover: 'hover:from-green-700 hover:to-emerald-700',
      shadow: 'shadow-green-500/25',
      ring: 'focus:ring-green-500',
      dropHover: 'hover:border-green-400 hover:bg-green-50',
      textAccent: 'text-green-600',
      subtitleText: 'text-green-200',
    },
    blue: {
      gradient: 'from-blue-600 to-cyan-600',
      gradientHover: 'hover:from-blue-700 hover:to-cyan-700',
      shadow: 'shadow-blue-500/25',
      ring: 'focus:ring-blue-500',
      dropHover: 'hover:border-blue-400 hover:bg-blue-50',
      textAccent: 'text-blue-600',
      subtitleText: 'text-blue-200',
    },
  };

  const tema = colores[colorTema];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!FORMATOS_MIME.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
        setError('Formato no soportado. Use PDF, Word (.doc/.docx) o TXT.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        setError('El archivo es muy grande. Máximo 10MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!FORMATOS_MIME.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
        setError('Formato no soportado. Use PDF, Word (.doc/.docx) o TXT.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleGenerar = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona un documento");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await articuloService.generarArticuloDesdeDocumento(
        selectedFile,
        idCreador
      );

      if (response.exito && response.contenidoGenerado) {
        showToast("✨ Artículo generado desde documento exitosamente", "success");
        onArticuloGenerado(response.contenidoGenerado);
        handleClose();
      } else {
        setError(response.mensaje || "Error al procesar el documento");
        if (response.errores?.length) {
          setError(response.errores.join(", "));
        }
      }
    } catch (err: unknown) {
      console.error("Error al generar desde documento:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión con el servidor";
      setError(errorMessage);
      showToast("Error al procesar el documento", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return '📄';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return '📝';
    if (fileName.endsWith('.txt')) return '📃';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header con gradiente */}
        <div className={`bg-gradient-to-r ${tema.gradient} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {titulo}
                </h2>
                <p className={`${tema.subtitleText} text-sm`}>
                  {subtitulo}
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Upload className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                {mensajeInfo}
              </p>
            </div>
          </div>

          {/* Zona de drop */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-green-300 bg-green-50'
                : `border-gray-300 ${tema.dropHover}`
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={FORMATOS_SOPORTADOS}
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Quitar archivo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  <span className={`${tema.textAccent} font-medium`}>Haz clic para seleccionar</span>
                  {" "}o arrastra un archivo aquí
                </p>
                <p className="text-xs text-gray-400">
                  PDF, Word (.doc, .docx) o TXT • Máx. 10MB
                </p>
              </div>
            )}
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
            disabled={loading || !selectedFile}
            className={`px-5 py-2.5 bg-gradient-to-r ${tema.gradient} text-white text-sm font-medium rounded-xl ${tema.gradientHover} disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg ${tema.shadow}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
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

export default GenerarDesdeDocumentoModal;
