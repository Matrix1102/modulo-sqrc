import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, BookOpen, ThumbsUp, X, Loader2, Tag } from "lucide-react";
import { useSugerenciasArticulos } from "../hooks/useArticulos";
import type { ArticuloResumenResponse, Visibilidad } from "../types/articulo";
import { ETIQUETA_CONFIG } from "../types/articulo";

interface BuscadorArticulosProps {
  /** Placeholder del input de búsqueda */
  placeholder?: string;
  /** Número máximo de sugerencias a mostrar (default: 4) */
  limite?: number;
  /** Visibilidad requerida (AGENTE siempre visible) */
  visibilidad?: Visibilidad;
  /** Callback cuando se selecciona un artículo */
  onArticuloSeleccionado?: (articulo: ArticuloResumenResponse) => void;
  /** Callback cuando se cierra el buscador */
  onClose?: () => void;
  /** Si el buscador está en modo compacto (para sidebar) */
  compacto?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Auto focus en el input al montar */
  autoFocus?: boolean;
}

/**
 * Componente de búsqueda de artículos con sugerencias rankeadas.
 *
 * Muestra sugerencias de artículos activos ordenados por:
 * 1. Relevancia (coincidencia en título > resumen > tags)
 * 2. Cantidad de feedbacks positivos
 *
 * Solo incluye artículos con versión publicada y vigentes.
 */
const BuscadorArticulos: React.FC<BuscadorArticulosProps> = ({
  placeholder = "Buscar artículos por palabras clave...",
  limite = 4,
  visibilidad,
  onArticuloSeleccionado,
  onClose,
  compacto = false,
  className = "",
  autoFocus = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { sugerencias, loading, buscar, limpiar, tieneSugerencias } =
    useSugerenciasArticulos(300);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      buscar(value, visibilidad, limite);
    },
    [buscar, visibilidad, limite]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    limpiar();
    inputRef.current?.focus();
  }, [limpiar]);

  const handleArticuloClick = useCallback(
    (articulo: ArticuloResumenResponse) => {
      onArticuloSeleccionado?.(articulo);
      setIsFocused(false);
    },
    [onArticuloSeleccionado]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClear();
        onClose?.();
      }
    },
    [handleClear, onClose]
  );

  const showDropdown =
    isFocused && (loading || tieneSugerencias || inputValue.trim().length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={compacto ? 16 : 18}
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${
            compacto ? "pl-9 pr-8 py-2 text-sm" : "pl-10 pr-10 py-2.5"
          } 
            border border-gray-200 rounded-lg outline-none 
            focus:ring-2 focus:ring-primary-100 focus:border-primary-300 
            transition-all bg-white`}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={compacto ? 14 : 16} />
          </button>
        )}
        {loading && (
          <Loader2
            className="absolute right-8 top-1/2 -translate-y-1/2 text-primary-500 animate-spin"
            size={compacto ? 14 : 16}
          />
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          {loading && sugerencias.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="inline-block animate-spin mr-2" size={16} />
              Buscando artículos...
            </div>
          ) : sugerencias.length === 0 && inputValue.trim().length > 0 ? (
            <div className="p-4 text-center text-gray-500">
              <BookOpen className="inline-block mr-2 text-gray-400" size={18} />
              No se encontraron artículos para "{inputValue}"
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Sugerencias ({sugerencias.length})
                </span>
              </div>

              {/* Lista de sugerencias */}
              <div className="max-h-80 overflow-y-auto">
                {sugerencias.map((articulo, index) => (
                  <SugerenciaItem
                    key={articulo.idArticulo}
                    articulo={articulo}
                    ranking={index + 1}
                    onClick={() => handleArticuloClick(articulo)}
                    compacto={compacto}
                    palabrasClave={inputValue}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============ Componente de Item de Sugerencia ============

interface SugerenciaItemProps {
  articulo: ArticuloResumenResponse;
  ranking: number;
  onClick: () => void;
  compacto?: boolean;
  palabrasClave?: string;
}

const SugerenciaItem: React.FC<SugerenciaItemProps> = ({
  articulo,
  ranking,
  onClick,
  compacto = false,
  palabrasClave = "",
}) => {
  const etiquetaConfig = ETIQUETA_CONFIG[articulo.etiqueta];

  // Resaltar coincidencias en el texto
  const highlightMatch = (text: string) => {
    if (!palabrasClave.trim() || !text) return text;

    const palabras = palabrasClave.trim().split(/\s+/);
    let result = text;

    palabras.forEach((palabra) => {
      const regex = new RegExp(`(${palabra})`, "gi");
      result = result.replace(
        regex,
        '<mark class="bg-yellow-200 text-gray-900 rounded px-0.5">$1</mark>'
      );
    });

    return result;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 cursor-pointer 
        hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0
        ${compacto ? "py-2" : "py-3"}`}
    >
      {/* Ranking badge */}
      <div
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
          ${
            ranking === 1
              ? "bg-primary-100 text-primary-700"
              : "bg-gray-100 text-gray-600"
          }`}
      >
        {ranking}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Título */}
        <h4
          className={`font-medium text-gray-900 truncate ${
            compacto ? "text-sm" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: highlightMatch(articulo.titulo) }}
        />

        {/* Resumen */}
        {articulo.resumen && !compacto && (
          <p
            className="text-sm text-gray-500 line-clamp-1 mt-0.5"
            dangerouslySetInnerHTML={{
              __html: highlightMatch(articulo.resumen),
            }}
          />
        )}

        {/* Tags y metadata */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Etiqueta */}
          <span
            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${etiquetaConfig.color}15`,
              color: etiquetaConfig.color,
            }}
          >
            <span>{etiquetaConfig.icon}</span>
            {etiquetaConfig.label}
          </span>

          {/* Tags del artículo */}
          {articulo.tags && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Tag size={10} />
              <span className="truncate max-w-24">
                {articulo.tags.split(",").slice(0, 2).join(", ")}
              </span>
            </span>
          )}

          {/* Feedbacks positivos */}
          {articulo.feedbacksPositivos > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <ThumbsUp size={10} />
              {articulo.feedbacksPositivos}
            </span>
          )}

          {/* Código */}
          <span className="text-xs text-gray-400 ml-auto">
            {articulo.codigo}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BuscadorArticulos;
