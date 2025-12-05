import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronDown,
  X,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useArticulos, useArticulo } from "../hooks/useArticulos";
import { useBasePath } from "../hooks/useBasePath";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import ArticuloModal from "./ArticuloModal";
import BuscadorArticulos from "./BuscadorArticulos";
import type {
  BusquedaArticuloRequest,
  ArticuloResumenResponse,
  Etiqueta,
  TipoCaso,
  Visibilidad,
} from "../types/articulo";
import {
  VISIBILIDAD_LABELS,
  ETIQUETA_OPTIONS,
  TIPO_CASO_OPTIONS,
  VISIBILIDAD_OPTIONS,
  ETIQUETA_LABELS,
  TIPO_CASO_LABELS,
} from "../types/articulo";

const TodosArticulosView: React.FC = () => {
  const navigate = useNavigate();
  const { buildPath } = useBasePath();
  const userId = useUserId();

  const [selectedArticuloId, setSelectedArticuloId] = useState<number | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estado de filtros
  const [filtros, setFiltros] = useState<BusquedaArticuloRequest>({
    soloPublicados: true,
    ordenarPor: "actualizadoEn",
    direccion: "DESC",
    pagina: 0,
    tamanoPagina: 20,
  });

  const { data, loading, refetch } = useArticulos(filtros);
  const { data: articuloSeleccionado, loading: loadingArticulo } =
    useArticulo(selectedArticuloId);

  const articulos = useMemo(() => data?.contenido || [], [data]);
  const totalResultados = data?.totalElementos || 0;

  // Handler para cambiar filtros
  const handleFiltroChange = useCallback(
    (key: keyof BusquedaArticuloRequest, value: any) => {
      setFiltros((prev) => ({
        ...prev,
        [key]: value || undefined,
        pagina: 0,
      }));
    },
    []
  );

  // Limpiar todos los filtros
  const handleClearFilters = useCallback(() => {
    setFiltros({
      soloPublicados: true,
      ordenarPor: "actualizadoEn",
      direccion: "DESC",
      pagina: 0,
      tamanoPagina: 20,
    });
  }, []);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filtros.etiqueta) count++;
    if (filtros.tipoCaso) count++;
    if (filtros.visibilidad) count++;
    if (filtros.soloVigentes) count++;
    return count;
  }, [filtros]);

  const handleArticuloClick = useCallback(
    (articulo: ArticuloResumenResponse) => {
      setSelectedArticuloId(articulo.idArticulo);
      setShowModal(true);
      setFeedbackGiven(null);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleExpand = useCallback(() => {
    if (selectedArticuloId) {
      navigate(buildPath(`/articulo/${selectedArticuloId}`));
    }
  }, [selectedArticuloId, navigate, buildPath]);

  const handleEdit = useCallback(() => {
    if (selectedArticuloId) {
      navigate(buildPath(`/editar/${selectedArticuloId}`));
    }
  }, [selectedArticuloId, navigate, buildPath]);

  const handleFeedback = useCallback(
    async (util: boolean) => {
      if (!articuloSeleccionado || !articuloSeleccionado.versionVigente) {
        showToast("No se puede enviar feedback sin versión vigente", "warning");
        return;
      }

      try {
        await articuloService.feedbackRapido(
          articuloSeleccionado.idArticulo,
          articuloSeleccionado.versionVigente,
          userId,
          util
        );
        setFeedbackGiven(util);
        showToast(
          util
            ? "¡Gracias por tu feedback positivo!"
            : "Gracias por tu feedback",
          "success"
        );
        refetch();
      } catch (error) {
        console.error("Error al enviar feedback:", error);
        showToast("Error al enviar feedback", "error");
      }
    },
    [articuloSeleccionado, userId, refetch]
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
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
    <div className="flex gap-6 min-h-[600px]">
      {/* Left Panel - Search & Results */}
      <div className="w-96 shrink-0 flex flex-col">
        {/* Buscador con sugerencias rankeadas por eficacia */}
        <div className="mb-3">
          <BuscadorArticulos
            placeholder="Buscar por palabras clave..."
            limite={5}
            visibilidad="AGENTE"
            onArticuloSeleccionado={(articulo) => {
              handleArticuloClick(articulo);
            }}
            autoFocus
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Categoría */}
          <div className="relative">
            <select
              value={filtros.etiqueta || ""}
              onChange={(e) =>
                handleFiltroChange("etiqueta", e.target.value as Etiqueta)
              }
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="">Categoría</option>
              {ETIQUETA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Tipo de Caso */}
          <div className="relative">
            <select
              value={filtros.tipoCaso || ""}
              onChange={(e) =>
                handleFiltroChange("tipoCaso", e.target.value as TipoCaso)
              }
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="">Tipo caso</option>
              {TIPO_CASO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Visibilidad */}
          <div className="relative">
            <select
              value={filtros.visibilidad || ""}
              onChange={(e) =>
                handleFiltroChange("visibilidad", e.target.value as Visibilidad)
              }
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="">Visibilidad</option>
              {VISIBILIDAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Más filtros */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showAdvancedFilters || activeFiltersCount > 0
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Filter size={12} />
            Más
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Limpiar */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <RotateCcw size={12} />
              Limpiar
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filtros.soloVigentes || false}
                  onChange={(e) =>
                    handleFiltroChange(
                      "soloVigentes",
                      e.target.checked || undefined
                    )
                  }
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Solo vigentes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filtros.soloPublicados !== false}
                  onChange={(e) =>
                    handleFiltroChange("soloPublicados", e.target.checked)
                  }
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Solo publicados</span>
              </label>

              {/* Ordenamiento */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={filtros.ordenarPor || "actualizadoEn"}
                  onChange={(e) =>
                    handleFiltroChange("ordenarPor", e.target.value)
                  }
                  className="appearance-none bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                >
                  <option value="actualizadoEn">Recientes</option>
                  <option value="titulo">Alfabético</option>
                  <option value="feedbacksPositivos">Más útiles</option>
                </select>
                <button
                  onClick={() =>
                    handleFiltroChange(
                      "direccion",
                      filtros.direccion === "ASC" ? "DESC" : "ASC"
                    )
                  }
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                  {filtros.direccion === "ASC" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {(filtros.etiqueta ||
          filtros.tipoCaso ||
          filtros.visibilidad ||
          filtros.soloVigentes) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {filtros.etiqueta && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                {ETIQUETA_LABELS[filtros.etiqueta]}
                <button
                  onClick={() => handleFiltroChange("etiqueta", undefined)}
                  className="hover:opacity-70"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filtros.tipoCaso && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                {TIPO_CASO_LABELS[filtros.tipoCaso]}
                <button
                  onClick={() => handleFiltroChange("tipoCaso", undefined)}
                  className="hover:opacity-70"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filtros.visibilidad && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                {VISIBILIDAD_LABELS[filtros.visibilidad]}
                <button
                  onClick={() => handleFiltroChange("visibilidad", undefined)}
                  className="hover:opacity-70"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filtros.soloVigentes && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                Solo vigentes
                <button
                  onClick={() => handleFiltroChange("soloVigentes", undefined)}
                  className="hover:opacity-70"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <span>
            {loading ? "Buscando..." : `${totalResultados} resultados`}
          </span>
        </div>

        {/* Results List - Max 3 visible with scroll */}
        <div
          className="overflow-y-auto space-y-3"
          style={{ maxHeight: "calc(3.5 * 160px)" }}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          ) : articulos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No se encontraron artículos
            </div>
          ) : (
            articulos.map((articulo) => (
              <div
                key={articulo.idArticulo}
                onClick={() => handleArticuloClick(articulo)}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm ${
                  selectedArticuloId === articulo.idArticulo
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200"
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">
                  {articulo.titulo}
                </h4>
                <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                  {articulo.resumen || "Descripción del artículo"}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {VISIBILIDAD_LABELS[articulo.visibilidad] || "Externo"}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    {articulo.estado || "Publicado"}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="text-blue-600 font-medium">
                    {articulo.codigo}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {articulo.feedbacksPositivos || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {articulo.vistas || 1}
                  </span>
                  <span>{formatDate(articulo.fechaModificacion)}</span>
                </div>

                {/* Match info */}
                <p className="text-xs text-gray-400 mt-2 italic">
                  No se encontraron más coincidencias en este artículo.
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Article Detail */}
      <div className="flex-1 bg-gray-50/50 rounded-lg border border-gray-100">
        {!selectedArticuloId ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Selecciona un artículo para ver su contenido
          </div>
        ) : loadingArticulo || !articuloSeleccionado ? (
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="flex gap-2 mb-6">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {articuloSeleccionado.titulo}
            </h2>

            {/* Tags & Date */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                {VISIBILIDAD_LABELS[articuloSeleccionado.visibilidad]}
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">
                {articuloSeleccionado.estadoVersionVigente || "Publicado"}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                <ThumbsUp size={14} />
                {articuloSeleccionado.feedbacksPositivos}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Eye size={14} />
                {articuloSeleccionado.versionVigente || 1}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(
                  articuloSeleccionado.actualizadoEn ||
                    articuloSeleccionado.creadoEn
                )}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Propósito y alcance
              </h3>
              <p className="text-gray-600 mb-6">
                {articuloSeleccionado.resumen ||
                  "Si tienes alguna pregunta sobre cualquiera de los productos o servicios que has adquirido, puedes usar el portal de soporte para solicitar ayuda."}
              </p>

              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Procedimiento
              </h3>
              {articuloSeleccionado.contenidoVersionVigente ? (
                <div
                  className="text-gray-600 mb-6"
                  dangerouslySetInnerHTML={{
                    __html: articuloSeleccionado.contenidoVersionVigente,
                  }}
                />
              ) : (
                <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-6">
                  <li>En el portal, haz clic en Soporte → Enviar un caso.</li>
                  <li>
                    Completa tu nombre, información de contacto, nombre del
                    producto y número de pedido.
                  </li>
                  <li>
                    En el menú desplegable Categoría del caso, selecciona la
                    categoría que mejor describa el problema que estás
                    experimentando.
                  </li>
                </ol>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Comentarios adicionales
              </h3>
              <p className="text-gray-600">
                Una vez que tu solicitud de soporte haya sido enviada, recibirás
                una comunicación de seguimiento del equipo de soporte. Puedes
                agregar cualquier nota o información adicional haciendo clic en
                el caso desde la pantalla Mis Casos.
              </p>
            </div>

            {/* Feedback */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-lg py-4">
                <span className="text-gray-600">
                  ¿Te resultó útil este artículo?
                </span>
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackGiven !== null}
                  className={`p-2 rounded-lg transition-all ${
                    feedbackGiven === true
                      ? "bg-green-100 text-green-600"
                      : "hover:bg-white text-gray-500 hover:text-green-600"
                  } ${
                    feedbackGiven !== null && feedbackGiven !== true
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <ThumbsUp size={20} />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackGiven !== null}
                  className={`p-2 rounded-lg transition-all ${
                    feedbackGiven === false
                      ? "bg-red-100 text-red-600"
                      : "hover:bg-white text-gray-500 hover:text-red-600"
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
        )}
      </div>

      {/* Modal del Artículo */}
      {articuloSeleccionado && (
        <ArticuloModal
          articulo={articuloSeleccionado}
          isOpen={showModal}
          onClose={handleCloseModal}
          onExpand={handleExpand}
          onEdit={handleEdit}
          onFeedback={handleFeedback}
          feedbackGiven={feedbackGiven}
          showEditButton={true}
        />
      )}
    </div>
  );
};

export default TodosArticulosView;
