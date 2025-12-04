import React from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Eye,
  History,
  Edit3,
} from "lucide-react";
import type { ArticuloResponse } from "../types/articulo";
import { ETIQUETA_LABELS, VISIBILIDAD_LABELS } from "../types/articulo";

interface ArticuloDetailPanelProps {
  articulo: ArticuloResponse;
  onFeedback?: (util: boolean) => void;
  onEdit?: () => void;
  feedbackGiven?: boolean | null;
  loading?: boolean;
}

export const ArticuloDetailPanel: React.FC<ArticuloDetailPanelProps> = ({
  articulo,
  onFeedback,
  onEdit,
  feedbackGiven,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-full mb-2" />
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-medium">
              {VISIBILIDAD_LABELS[articulo.visibilidad] || articulo.visibilidad}
            </span>
            <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-xs font-medium">
              {articulo.estadoVersionVigente || "Publicado"}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(articulo.actualizadoEn || articulo.creadoEn)}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {articulo.titulo}
        </h1>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {articulo.codigo}
          </span>
          {articulo.etiqueta && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {ETIQUETA_LABELS[articulo.etiqueta] || articulo.etiqueta}
            </span>
          )}
        </div>

        {/* Tags */}
        {articulo.tags && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {articulo.tags.split(',').map((tag, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <ThumbsUp size={16} className="text-green-500" />
            {articulo.feedbacksPositivos}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={16} />
            {articulo.versionVigente
              ? `v${articulo.versionVigente}`
              : "Sin versión"}
          </span>
          <span className="flex items-center gap-1.5">
            <History size={16} />
            {articulo.totalVersiones} versiones
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Propósito y alcance
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {articulo.resumen || "Sin resumen disponible."}
        </p>

        {articulo.contenidoVersionVigente && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Procedimiento
            </h2>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html: articulo.contenidoVersionVigente,
              }}
            />
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="text-gray-600">
              <strong>Autor:</strong> {articulo.nombrePropietario}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-gray-600">
              <strong>Creado:</strong> {formatDate(articulo.creadoEn)}
            </span>
          </div>
          {articulo.nombreUltimoEditor && (
            <div className="flex items-center gap-2">
              <Edit3 size={16} className="text-gray-400" />
              <span className="text-gray-600">
                <strong>Editado por:</strong> {articulo.nombreUltimoEditor}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback section */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            ¿Te resultó útil este artículo?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFeedback?.(true)}
              disabled={feedbackGiven !== null}
              className={`p-2 rounded-lg transition-all ${
                feedbackGiven === true
                  ? "bg-green-100 text-green-600"
                  : "hover:bg-gray-100 text-gray-500 hover:text-green-600"
              } ${
                feedbackGiven !== null && feedbackGiven !== true
                  ? "opacity-50"
                  : ""
              }`}
            >
              <ThumbsUp size={20} />
            </button>
            <button
              onClick={() => onFeedback?.(false)}
              disabled={feedbackGiven !== null}
              className={`p-2 rounded-lg transition-all ${
                feedbackGiven === false
                  ? "bg-red-100 text-red-600"
                  : "hover:bg-gray-100 text-gray-500 hover:text-red-600"
              } ${
                feedbackGiven !== null && feedbackGiven !== false
                  ? "opacity-50"
                  : ""
              }`}
            >
              <ThumbsDown size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit button */}
      {onEdit && (
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={16} />
            Editar artículo
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticuloDetailPanel;
