import React from "react";
import { Search, ChevronDown } from "lucide-react";
import type {
  Etiqueta,
  Visibilidad,
  BusquedaArticuloRequest,
} from "../types/articulo";
import { ETIQUETA_OPTIONS, VISIBILIDAD_OPTIONS } from "../types/articulo";

interface ArticuloSearchPanelProps {
  filtros: BusquedaArticuloRequest;
  onFiltrosChange: (filtros: Partial<BusquedaArticuloRequest>) => void;
  resultados: number;
  loading?: boolean;
}

export const ArticuloSearchPanel: React.FC<ArticuloSearchPanelProps> = ({
  filtros,
  onFiltrosChange,
  resultados,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
      {/* Search input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar artículo..."
          value={filtros.texto || ""}
          onChange={(e) => onFiltrosChange({ texto: e.target.value })}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 transition-all"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Categoría */}
        <div className="relative">
          <select
            value={filtros.etiqueta || ""}
            onChange={(e) =>
              onFiltrosChange({
                etiqueta: (e.target.value as Etiqueta) || undefined,
              })
            }
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {ETIQUETA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Visibilidad */}
        <div className="relative">
          <select
            value={filtros.visibilidad || ""}
            onChange={(e) =>
              onFiltrosChange({
                visibilidad: (e.target.value as Visibilidad) || undefined,
              })
            }
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
          >
            <option value="">Toda visibilidad</option>
            {VISIBILIDAD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Ordenar por */}
        <div className="relative">
          <select
            value={filtros.ordenarPor || "actualizadoEn"}
            onChange={(e) => onFiltrosChange({ ordenarPor: e.target.value })}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
          >
            <option value="actualizadoEn">Más recientes</option>
            <option value="titulo">Alfabético</option>
            <option value="feedbacksPositivos">Más útiles</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Results count */}
        <div className="ml-auto text-sm text-gray-500">
          {loading ? (
            <span className="animate-pulse">Buscando...</span>
          ) : (
            <span>
              <strong>{resultados}</strong> resultados encontrados
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticuloSearchPanel;
