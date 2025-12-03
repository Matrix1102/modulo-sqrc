import React from "react";
import {
  FileText,
  ThumbsUp,
  Edit,
  Send,
  Archive,
  Eye,
  TrendingUp,
} from "lucide-react";
import type { ArticuloResumen, EstadoArticulo } from "../types/articulo";
import { ETIQUETA_CONFIG } from "../types/articulo";

interface ArticuloColumnCardProps {
  articulo: ArticuloResumen;
  onClick?: (articulo: ArticuloResumen) => void;
  showStats?: boolean;
}

const getEstadoIcon = (estado: EstadoArticulo) => {
  switch (estado) {
    case "PROPUESTO":
      return <Send size={14} className="text-amber-500" />;
    case "BORRADOR":
      return <Edit size={14} className="text-blue-500" />;
    case "PUBLICADO":
      return <Eye size={14} className="text-success-500" />;
    case "DEPRECADO":
      return <Archive size={14} className="text-gray-400" />;
    default:
      return <FileText size={14} className="text-gray-400" />;
  }
};

export const ArticuloColumnCard: React.FC<ArticuloColumnCardProps> = ({
  articulo,
  onClick,
  showStats = false,
}) => {
  const etiquetaConfig = ETIQUETA_CONFIG[articulo.etiqueta];

  return (
    <div
      onClick={() => onClick?.(articulo)}
      className={`
        bg-white rounded-lg border border-gray-100 p-3 mb-2
        hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Header: Título y estado */}
      <div className="flex items-start gap-2 mb-2">
        {getEstadoIcon(articulo.estado)}
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1">
          {articulo.titulo}
        </h4>
      </div>

      {/* Etiqueta */}
      <div className="mb-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: `${etiquetaConfig?.color}15`,
            color: etiquetaConfig?.color,
          }}
        >
          {etiquetaConfig?.icon && <span>{etiquetaConfig.icon}</span>}
          {etiquetaConfig?.label || articulo.etiqueta}
        </span>
      </div>

      {/* Stats (opcional) */}
      {showStats && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} />
            {articulo.feedbacksPositivos}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {articulo.versionActual}v
          </span>
        </div>
      )}

      {/* Fecha actualización */}
      <div className="mt-2 text-xs text-gray-400">
        {new Date(articulo.actualizadoEn).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        })}
      </div>
    </div>
  );
};

// Columna completa con título y lista de artículos
interface ArticuloColumnProps {
  titulo: string;
  icono: React.ReactNode;
  articulos: ArticuloResumen[];
  color?: string;
  emptyMessage?: string;
  loading?: boolean;
  onArticuloClick?: (articulo: ArticuloResumen) => void;
  showStats?: boolean;
}

export const ArticuloColumn: React.FC<ArticuloColumnProps> = ({
  titulo,
  icono,
  articulos,
  color = "#6B7280",
  emptyMessage = "No hay artículos",
  loading = false,
  onArticuloClick,
  showStats = false,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 mb-3 pb-2 border-b-2"
        style={{ borderColor: color }}
      >
        <span style={{ color }}>{icono}</span>
        <h3 className="font-semibold text-gray-800">{titulo}</h3>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
          {articulos.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-1 custom-scrollbar">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-3 mb-2 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))
        ) : articulos.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            {emptyMessage}
          </div>
        ) : (
          articulos.map((articulo) => (
            <ArticuloColumnCard
              key={articulo.id}
              articulo={articulo}
              onClick={onArticuloClick}
              showStats={showStats}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ArticuloColumn;
