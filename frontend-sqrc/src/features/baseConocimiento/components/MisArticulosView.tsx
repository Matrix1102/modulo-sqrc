import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Database, User } from "lucide-react";
import { useMisArticulos, useArticulo } from "../hooks/useArticulos";
import { useUserId } from "../../../context";
import articuloService from "../services/articuloService";
import showToast from "../../../services/notification";
import ArticuloModal from "./ArticuloModal";
import type { ArticuloResumenResponse } from "../types/articulo";

interface ArticuloCardProps {
  articulo: ArticuloResumenResponse;
  estadoLabel: string;
  estadoColor: string;
  onClick: () => void;
}

const ArticuloMiniCard: React.FC<ArticuloCardProps> = ({
  articulo,
  estadoLabel,
  estadoColor,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-100 p-3 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Author */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={12} className="text-gray-500" />
        </div>
        <span className="text-xs text-blue-600">
          {articulo.nombrePropietario || "Andre Cuenca"}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-blue-700 mb-1 line-clamp-1">
        {articulo.titulo || "Nombre del artículo"}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
        {articulo.resumen || "Descripción del artículo"}
      </p>

      {/* Status */}
      <span className={`text-xs ${estadoColor}`}>{estadoLabel}</span>
    </div>
  );
};

interface ColumnProps {
  title: string;
  count: number;
  articulos: ArticuloResumenResponse[];
  loading: boolean;
  estadoLabel: string;
  estadoColor: string;
  emptyMessage?: string;
  onArticuloClick: (idArticulo: number) => void;
}

const KanbanColumn: React.FC<ColumnProps> = ({
  title,
  count,
  articulos,
  loading,
  estadoLabel,
  estadoColor,
  emptyMessage = "No hay datos disponibles",
  onArticuloClick,
}) => {
  return (
    <div className="flex flex-col min-w-60">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-blue-500">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-500">Filtrado</span>
      </div>

      {/* Count & Sort */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="font-bold text-gray-700">{count}</span>
        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
          Modificado el
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px]">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : articulos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Database size={40} className="mb-2 opacity-50" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          articulos.map((articulo) => (
            <ArticuloMiniCard
              key={articulo.idArticulo}
              articulo={articulo}
              estadoLabel={estadoLabel}
              estadoColor={estadoColor}
              onClick={() => onArticuloClick(articulo.idArticulo)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const MisArticulosView: React.FC = () => {
  const userId = useUserId();
  const navigate = useNavigate();

  // Estado del modal
  const [showModal, setShowModal] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState<number | null>(
    null
  );

  const {
    articulos: misArticulos,
    borradores,
    deprecados,
    populares,
    loading,
    refetch,
  } = useMisArticulos(userId);

  // Obtener artículo seleccionado
  const { data: articuloSeleccionado, loading: loadingArticulo } =
    useArticulo(selectedArticuloId);

  // Filtrar propuestos de misArticulos
  const propuestos = useMemo(
    () => misArticulos.filter((a) => a.estado === "PROPUESTO"),
    [misArticulos]
  );

  // Artículos vencidos/deprecados
  const vencidos = useMemo(
    () => deprecados.filter((a) => a.estado === "DEPRECADO" || !a.estaVigente),
    [deprecados]
  );

  // Handlers
  const handleArticuloClick = useCallback((idArticulo: number) => {
    setSelectedArticuloId(idArticulo);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedArticuloId(null);
  }, []);

  const handleExpand = useCallback(() => {
    if (selectedArticuloId) {
      navigate(`/base-conocimiento/articulo/${selectedArticuloId}`);
    }
  }, [selectedArticuloId, navigate]);

  const handleEdit = useCallback(() => {
    if (selectedArticuloId) {
      navigate(`/base-conocimiento/editar/${selectedArticuloId}`);
    }
  }, [selectedArticuloId, navigate]);

  const handleFeedback = useCallback(
    async (esUtil: boolean) => {
      if (!selectedArticuloId || !articuloSeleccionado) return;
      try {
        await articuloService.feedbackRapido(
          selectedArticuloId,
          articuloSeleccionado.versionVigente || 1,
          userId,
          esUtil
        );
        showToast("¡Gracias por tu feedback!", "success");
        refetch();
      } catch (error) {
        showToast("Error al registrar feedback", "error");
      }
    },
    [selectedArticuloId, articuloSeleccionado, userId, refetch]
  );

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {/* Columna 1: Artículos propuestos */}
        <KanbanColumn
          title="Artículos propuestos"
          count={propuestos.length}
          articulos={propuestos}
          loading={loading}
          estadoLabel="Propuesto"
          estadoColor="text-amber-600"
          emptyMessage="No hay artículos propuestos"
          onArticuloClick={handleArticuloClick}
        />

        {/* Columna 2: Mis borradores */}
        <KanbanColumn
          title="Mis borradores"
          count={borradores.length}
          articulos={borradores}
          loading={loading}
          estadoLabel="Borrador"
          estadoColor="text-blue-600"
          emptyMessage="No hay datos disponibles"
          onArticuloClick={handleArticuloClick}
        />

        {/* Columna 3: Mis Artículos deprecados */}
        <KanbanColumn
          title="Mis Artículos deprecados"
          count={vencidos.length}
          articulos={vencidos}
          loading={loading}
          estadoLabel="Vencido"
          estadoColor="text-red-500"
          emptyMessage="No hay artículos deprecados"
          onArticuloClick={handleArticuloClick}
        />

        {/* Columna 4: Mis Artículos más populares */}
        <KanbanColumn
          title="Mis Artículos más populares"
          count={populares.length}
          articulos={populares}
          loading={loading}
          estadoLabel="Propuesto"
          estadoColor="text-amber-600"
          emptyMessage="No hay artículos populares"
          onArticuloClick={handleArticuloClick}
        />
      </div>

      {/* Modal de artículo */}
      {articuloSeleccionado && !loadingArticulo && (
        <ArticuloModal
          articulo={articuloSeleccionado}
          isOpen={showModal}
          onClose={handleCloseModal}
          onExpand={handleExpand}
          onEdit={handleEdit}
          onFeedback={handleFeedback}
        />
      )}
    </>
  );
};

export default MisArticulosView;
