import React, { useCallback, useState } from "react";
import {
  X,
  Maximize2,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Calendar,
  User,
  Tag,
  Clock,
} from "lucide-react";
import type { ArticuloResponse } from "../types/articulo";
import {
  VISIBILIDAD_LABELS,
  ETIQUETA_LABELS,
  TIPO_CASO_LABELS,
} from "../types/articulo";

interface ArticuloModalProps {
  articulo: ArticuloResponse;
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
  onEdit: () => void;
  onFeedback?: (util: boolean) => Promise<void>;
  feedbackGiven?: boolean | null;
  showEditButton?: boolean;
}

const ArticuloModal: React.FC<ArticuloModalProps> = ({
  articulo,
  isOpen,
  onClose,
  onExpand,
  onEdit,
  onFeedback,
  feedbackGiven = null,
  showEditButton = true,
}) => {
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleFeedback = useCallback(
    async (util: boolean) => {
      if (!onFeedback || feedbackGiven !== null) return;
      setFeedbackLoading(true);
      try {
        await onFeedback(util);
      } finally {
        setFeedbackLoading(false);
      }
    },
    [onFeedback, feedbackGiven]
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No especificado";
    try {
      return new Date(dateStr).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {articulo.codigo}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                articulo.estadoVersionVigente === "PUBLICADO"
                  ? "bg-green-100 text-green-700"
                  : articulo.estadoVersionVigente === "PROPUESTO"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {articulo.estadoVersionVigente || "Borrador"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showEditButton && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar artículo"
              >
                <Edit3 size={18} />
              </button>
            )}
            <button
              onClick={onExpand}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Expandir a pantalla completa"
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title & Meta */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {articulo.titulo}
          </h1>

          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
              <Tag size={12} />
              {ETIQUETA_LABELS[articulo.etiqueta]}
            </span>
            {articulo.tipoCaso && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {TIPO_CASO_LABELS[articulo.tipoCaso]}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {VISIBILIDAD_LABELS[articulo.visibilidad]}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Autor</p>
                <p className="font-medium text-gray-700">
                  {articulo.nombrePropietario}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Creado</p>
                <p className="font-medium text-gray-700">
                  {formatDate(articulo.creadoEn)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Actualizado</p>
                <p className="font-medium text-gray-700">
                  {formatDate(articulo.actualizadoEn || articulo.creadoEn)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Versión</p>
                <p className="font-medium text-gray-700">
                  v{articulo.versionVigente || 1}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          {articulo.resumen && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Resumen
              </h3>
              <p className="text-gray-700 bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-400">
                {articulo.resumen}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Contenido
            </h3>
            {articulo.contenidoVersionVigente ? (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: articulo.contenidoVersionVigente,
                }}
              />
            ) : (
              <p className="text-gray-500 italic">
                No hay contenido disponible para esta versión.
              </p>
            )}
          </div>

          {/* Vigencia */}
          {(articulo.vigenteDesde || articulo.vigenteHasta) && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">
                Vigencia
              </h3>
              <div className="flex items-center gap-4 text-sm text-amber-700">
                {articulo.vigenteDesde && (
                  <span>Desde: {formatDate(articulo.vigenteDesde)}</span>
                )}
                {articulo.vigenteHasta && (
                  <span>Hasta: {formatDate(articulo.vigenteHasta)}</span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ThumbsUp size={16} className="text-green-500" />
              <span>{articulo.feedbacksPositivos} útiles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye size={16} className="text-blue-500" />
              <span>{articulo.totalVersiones} versiones</span>
            </div>
            {articulo.calificacionPromedio > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>⭐</span>
                <span>{articulo.calificacionPromedio.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Feedback */}
        {onFeedback && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-600">
                ¿Te resultó útil este artículo?
              </span>
              <button
                onClick={() => handleFeedback(true)}
                disabled={feedbackGiven !== null || feedbackLoading}
                className={`p-2 rounded-lg transition-all ${
                  feedbackGiven === true
                    ? "bg-green-100 text-green-600"
                    : "hover:bg-green-50 text-gray-500 hover:text-green-600"
                } ${
                  feedbackGiven !== null && feedbackGiven !== true
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <ThumbsUp size={20} />
              </button>
              <button
                onClick={() => handleFeedback(false)}
                disabled={feedbackGiven !== null || feedbackLoading}
                className={`p-2 rounded-lg transition-all ${
                  feedbackGiven === false
                    ? "bg-red-100 text-red-600"
                    : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                } ${
                  feedbackGiven !== null && feedbackGiven !== false
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <ThumbsDown size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticuloModal;
