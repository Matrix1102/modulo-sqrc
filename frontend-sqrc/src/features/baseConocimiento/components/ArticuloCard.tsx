import React from "react";
import { Eye, ThumbsUp, Clock, User } from "lucide-react";
import type { ArticuloResumenResponse } from "../types/articulo";
import { ETIQUETA_LABELS } from "../types/articulo";

interface ArticuloCardProps {
  articulo: ArticuloResumenResponse;
  onClick?: (articulo: ArticuloResumenResponse) => void;
  variant?: "default" | "compact";
}

const estadoColors: Record<string, string> = {
  Publicado: "bg-green-100 text-green-700 border-green-200",
  Borrador: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Propuesto: "bg-blue-100 text-blue-700 border-blue-200",
  Vencido: "bg-red-100 text-red-700 border-red-200",
  Archivado: "bg-gray-100 text-gray-700 border-gray-200",
  BORRADOR: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PUBLICADO: "bg-green-100 text-green-700 border-green-200",
  ARCHIVADO: "bg-gray-100 text-gray-700 border-gray-200",
  RECHAZADO: "bg-red-100 text-red-700 border-red-200",
};

const visibilidadColors: Record<string, string> = {
  AGENTE: "bg-purple-100 text-purple-700",
  SUPERVISOR: "bg-orange-100 text-orange-700",
};

export const ArticuloCard: React.FC<ArticuloCardProps> = ({
  articulo,
  onClick,
  variant = "default",
}) => {
  const estadoClass = estadoColors[articulo.estado] || estadoColors["Borrador"];
  const visibilidadClass =
    visibilidadColors[articulo.visibilidad] || visibilidadColors["AGENTE"];

  if (variant === "compact") {
    return (
      <div
        onClick={() => onClick?.(articulo)}
        className="p-4 bg-white rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <User size={18} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary-500 font-medium mb-0.5">
              {articulo.nombrePropietario}
            </p>
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {articulo.titulo}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {articulo.resumen || "Sin descripción"}
            </p>
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${estadoClass}`}
            >
              {articulo.estado}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(articulo)}
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${visibilidadClass}`}
          >
            {articulo.visibilidad}
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${estadoClass}`}
          >
            {articulo.estado}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {articulo.fechaModificacion}
        </span>
      </div>

      {/* Título y descripción */}
      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
        {articulo.titulo}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {articulo.resumen || "Sin descripción disponible"}
      </p>

      {/* Código y etiqueta */}
      <div className="flex items-center gap-2 mb-2">
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
          {articulo.tags.split(",").map((tag, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
      {!articulo.tags && <div className="mb-4" />}

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} />
            {articulo.feedbacksPositivos}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {articulo.vistas}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">
            v{articulo.versionActual}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticuloCard;
