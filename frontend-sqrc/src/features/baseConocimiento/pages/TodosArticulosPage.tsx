import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, X } from "lucide-react";
import { useArticulos, useArticulo } from "../hooks/useArticulos";
import { ArticuloSearchPanel } from "../components/ArticuloSearchPanel";
import { ArticuloList } from "../components/ArticuloList";
import { ArticuloDetailPanel } from "../components/ArticuloDetailPanel";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import type {
  BusquedaArticuloRequest,
  ArticuloResumenResponse,
} from "../types/articulo";

export const TodosArticulosPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = useUserId();
  const [selectedArticuloId, setSelectedArticuloId] = useState<number | null>(
    null
  );
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [filtros, setFiltros] = useState<BusquedaArticuloRequest>({
    soloPublicados: true,
    ordenarPor: "actualizadoEn",
    direccion: "DESC",
    pagina: 0,
    tamanoPagina: 20,
  });

  const { data, loading, error, refetch } = useArticulos(filtros);
  const { data: articuloSeleccionado, loading: loadingArticulo } =
    useArticulo(selectedArticuloId);

  const articulos = useMemo(() => data?.contenido || [], [data]);
  const totalResultados = data?.totalElementos || 0;

  const handleFiltrosChange = useCallback(
    (newFiltros: Partial<BusquedaArticuloRequest>) => {
      setFiltros((prev) => ({
        ...prev,
        ...newFiltros,
        pagina: 0, // Reset página cuando cambian los filtros
      }));
    },
    []
  );

  const handleArticuloClick = useCallback(
    (articulo: ArticuloResumenResponse) => {
      setSelectedArticuloId(articulo.idArticulo);
      setFeedbackGiven(null); // Reset feedback al cambiar de artículo
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedArticuloId(null);
  }, []);

  const handleNuevoArticulo = useCallback(() => {
    navigate("/base-conocimiento/crear");
  }, [navigate]);

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

  const handlePaginaChange = useCallback((pagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary-600" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Base de Conocimiento
                </h1>
                <p className="text-sm text-gray-500">
                  Encuentra guías, políticas y procedimientos
                </p>
              </div>
            </div>

            <button
              onClick={handleNuevoArticulo}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Nuevo Artículo
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left: Search & List */}
          <div
            className={`flex-1 transition-all ${
              selectedArticuloId ? "max-w-md" : ""
            }`}
          >
            <ArticuloSearchPanel
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              resultados={totalResultados}
              loading={loading}
            />

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 mb-4">
                  Error al cargar los artículos
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                <ArticuloList
                  articulos={articulos}
                  loading={loading}
                  onSelect={handleArticuloClick}
                  variant={selectedArticuloId ? "list" : "grid"}
                  cardVariant={selectedArticuloId ? "compact" : "default"}
                />

                {/* Paginación */}
                {data && data.totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => handlePaginaChange(data.paginaActual - 1)}
                      disabled={data.esPrimera}
                      className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    <span className="px-3 py-1.5 text-sm text-gray-600">
                      Página {data.paginaActual + 1} de {data.totalPaginas}
                    </span>

                    <button
                      onClick={() => handlePaginaChange(data.paginaActual + 1)}
                      disabled={data.esUltima}
                      className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Detail Panel */}
          {selectedArticuloId && (
            <div className="w-[500px] shrink-0">
              <div className="sticky top-6">
                {loadingArticulo || !articuloSeleccionado ? (
                  <ArticuloDetailPanel articulo={{} as any} loading={true} />
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={handleCloseDetail}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <ArticuloDetailPanel
                      articulo={articuloSeleccionado}
                      onFeedback={handleFeedback}
                      feedbackGiven={feedbackGiven}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodosArticulosPage;
