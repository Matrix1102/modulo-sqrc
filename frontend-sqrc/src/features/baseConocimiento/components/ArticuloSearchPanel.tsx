import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, X, Filter, RotateCcw } from "lucide-react";
import type {
  Etiqueta,
  Visibilidad,
  TipoCaso,
  BusquedaArticuloRequest,
} from "../types/articulo";
import {
  ETIQUETA_OPTIONS,
  VISIBILIDAD_OPTIONS,
  TIPO_CASO_OPTIONS,
} from "../types/articulo";
import useDebouncedValue from "../../../components/ui/useDebouncedValue";

interface ArticuloSearchPanelProps {
  filtros: BusquedaArticuloRequest;
  onFiltrosChange: (filtros: Partial<BusquedaArticuloRequest>) => void;
  resultados: number;
  loading?: boolean;
  mostrarFiltrosAvanzados?: boolean;
}

export const ArticuloSearchPanel: React.FC<ArticuloSearchPanelProps> = ({
  filtros,
  onFiltrosChange,
  resultados,
  loading = false,
  mostrarFiltrosAvanzados = true,
}) => {
  // Estado local para el input de búsqueda (sin debounce)
  const [searchText, setSearchText] = useState(filtros.texto || "");
  // Estado para mostrar/ocultar filtros avanzados
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Valor con debounce que dispara la búsqueda
  const debouncedSearchText = useDebouncedValue(searchText, 400);

  // Sincronizar el valor debounced con los filtros
  useEffect(() => {
    if (debouncedSearchText !== filtros.texto) {
      onFiltrosChange({ texto: debouncedSearchText || undefined });
    }
  }, [debouncedSearchText, filtros.texto, onFiltrosChange]);

  // Sincronizar cuando los filtros externos cambian (ej: limpiar)
  useEffect(() => {
    if (filtros.texto !== searchText && filtros.texto !== debouncedSearchText) {
      setSearchText(filtros.texto || "");
    }
  }, [filtros.texto]);

  const handleClearSearch = () => {
    setSearchText("");
    onFiltrosChange({ texto: undefined });
  };

  // Contar filtros activos
  const filtrosActivos = [
    filtros.etiqueta,
    filtros.visibilidad,
    filtros.tipoCaso,
    filtros.soloVigentes,
    filtros.soloPublicados === false, // Si explícitamente es false
  ].filter(Boolean).length;

  // Limpiar todos los filtros
  const handleClearAllFilters = useCallback(() => {
    setSearchText("");
    onFiltrosChange({
      texto: undefined,
      etiqueta: undefined,
      visibilidad: undefined,
      tipoCaso: undefined,
      soloVigentes: undefined,
      soloPublicados: true, // Mantener solo publicados por defecto
      ordenarPor: "actualizadoEn",
      direccion: "DESC",
    });
  }, [onFiltrosChange]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
      {/* Search input */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por título, código, tags o contenido..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 transition-all"
        />
        {searchText && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
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

        {/* Tipo de Caso */}
        <div className="relative">
          <select
            value={filtros.tipoCaso || ""}
            onChange={(e) =>
              onFiltrosChange({
                tipoCaso: (e.target.value as TipoCaso) || undefined,
              })
            }
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            {TIPO_CASO_OPTIONS.map((opt) => (
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

        {/* Botón filtros avanzados */}
        {mostrarFiltrosAvanzados && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAdvanced || filtrosActivos > 0
                ? "bg-primary-100 text-primary-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Filter size={16} />
            Más filtros
            {filtrosActivos > 0 && (
              <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {filtrosActivos}
              </span>
            )}
          </button>
        )}

        {/* Limpiar filtros */}
        {(filtrosActivos > 0 || searchText) && (
          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw size={14} />
            Limpiar
          </button>
        )}

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

      {/* Filtros avanzados expandibles */}
      {showAdvanced && mostrarFiltrosAvanzados && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Solo vigentes */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.soloVigentes || false}
                onChange={(e) =>
                  onFiltrosChange({
                    soloVigentes: e.target.checked || undefined,
                  })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Solo vigentes</span>
            </label>

            {/* Solo publicados */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.soloPublicados !== false}
                onChange={(e) =>
                  onFiltrosChange({ soloPublicados: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Solo publicados</span>
            </label>

            {/* Dirección de ordenamiento */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Orden:</span>
              <button
                onClick={() =>
                  onFiltrosChange({
                    direccion: filtros.direccion === "ASC" ? "DESC" : "ASC",
                  })
                }
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filtros.direccion === "ASC"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {filtros.direccion === "ASC" ? "↑ Ascendente" : "↓ Descendente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticuloSearchPanel;
