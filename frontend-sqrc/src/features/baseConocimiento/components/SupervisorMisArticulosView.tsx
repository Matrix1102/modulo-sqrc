import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Database, ArrowDown, User, Calendar } from "lucide-react";
import { useMisArticulos, useArticulo } from "../hooks/useArticulos";
import { useBasePath } from "../hooks/useBasePath";
import { useUserId } from "../../../context";
import articuloService from "../services/articuloService";
import showToast from "../../../services/notification";
import ArticuloModal from "./ArticuloModal";
import type {
  ArticuloResumenResponse,
  EstadoArticulo,
} from "../types/articulo";

interface ColumnConfig {
  key: string;
  title: string;
  estado: EstadoArticulo | EstadoArticulo[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: "rechazados",
    title: "Artículos Rechazados",
    estado: "RECHAZADO",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    key: "propuestos",
    title: "Artículos Propuestos",
    estado: "PROPUESTO",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    key: "aceptados",
    title: "Artículos Aceptados",
    estado: ["PUBLICADO", "DEPRECADO"],
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    key: "archivados",
    title: "Artículos Archivados",
    estado: "ARCHIVADO",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
];

interface ArticuloCardProps {
  articulo: ArticuloResumenResponse;
  estadoLabel: string;
  estadoColor: string;
  onClick: () => void;
}

const ArticuloCard: React.FC<ArticuloCardProps> = ({
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
          {articulo.nombrePropietario || "Usuario"}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-blue-700 mb-1 line-clamp-1 hover:underline">
        {articulo.titulo}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
        {articulo.resumen || "Descripción del artículo"}
      </p>

      {/* Status */}
      <span className={`text-xs font-medium ${estadoColor}`}>
        {estadoLabel}
      </span>
    </div>
  );
};

interface ArticuloColumnProps {
  config: ColumnConfig;
  articulos: ArticuloResumenResponse[];
  onArticuloClick: (articulo: ArticuloResumenResponse) => void;
  showFilter?: boolean;
}

const ArticuloColumn: React.FC<ArticuloColumnProps> = ({
  config,
  articulos,
  onArticuloClick,
  showFilter = false,
}) => {
  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      RECHAZADO: "Rechazado",
      PROPUESTO: "Propuesto",
      PUBLICADO: "Publicado",
      DEPRECADO: "Vencido",
      ARCHIVADO: "Propuesto",
      BORRADOR: "Borrador",
    };
    return labels[estado] || estado;
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      RECHAZADO: "text-red-500",
      PROPUESTO: "text-yellow-600",
      PUBLICADO: "text-green-500",
      DEPRECADO: "text-orange-500",
      ARCHIVADO: "text-gray-500",
      BORRADOR: "text-blue-500",
    };
    return colors[estado] || "text-gray-500";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-800">{config.title}</h3>
        {showFilter && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Filtrado
          </span>
        )}
      </div>

      {/* Count and sort */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg font-bold text-gray-700">
          {articulos.length}
        </span>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
          <ArrowDown size={12} />
          <span>Modificado el</span>
        </button>
      </div>

      {/* Articles list */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px] max-h-[500px]">
        {articulos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Database size={40} className="mb-2" />
            <span className="text-sm">No hay datos disponibles</span>
          </div>
        ) : (
          articulos.map((articulo) => (
            <ArticuloCard
              key={articulo.idArticulo}
              articulo={articulo}
              estadoLabel={getEstadoLabel(articulo.estado)}
              estadoColor={getEstadoColor(articulo.estado)}
              onClick={() => onArticuloClick(articulo)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SupervisorMisArticulosView: React.FC = () => {
  const userId = useUserId();
  const navigate = useNavigate();
  const { buildPath } = useBasePath();

  // Estado del modal
  const [showModal, setShowModal] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState<number | null>(
    null
  );

  // Obtener mis artículos
  const { articulos: misArticulos, loading, refetch } = useMisArticulos(userId);

  // Obtener artículo seleccionado para el modal
  const { data: articuloSeleccionado, loading: loadingArticulo } =
    useArticulo(selectedArticuloId);

  // Agrupar artículos por estado
  const articulosPorEstado = useMemo(() => {
    const grouped: Record<string, ArticuloResumenResponse[]> = {
      rechazados: [],
      propuestos: [],
      aceptados: [],
      archivados: [],
    };

    misArticulos.forEach((articulo) => {
      const estado = articulo.estado;
      if (estado === "RECHAZADO") {
        grouped.rechazados.push(articulo);
      } else if (estado === "PROPUESTO") {
        grouped.propuestos.push(articulo);
      } else if (estado === "PUBLICADO" || estado === "DEPRECADO") {
        grouped.aceptados.push(articulo);
      } else if (estado === "ARCHIVADO") {
        grouped.archivados.push(articulo);
      }
    });

    return grouped;
  }, [misArticulos]);

  const handleArticuloClick = useCallback(
    (articulo: ArticuloResumenResponse) => {
      setSelectedArticuloId(articulo.idArticulo);
      setShowModal(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedArticuloId(null);
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
    async (esUtil: boolean) => {
      if (!selectedArticuloId || !articuloSeleccionado) return;
      try {
        await articuloService.feedbackRapido(
          selectedArticuloId,
          articuloSeleccionado.versionVigente || 1,
          userId,
          esUtil
        );
        showToast(
          esUtil
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
    [selectedArticuloId, articuloSeleccionado, userId, refetch]
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Date selector */}
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
          <Calendar size={16} />
          <span>Este trimestre, del 01/10/2025 al 31/12/2025</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Columns grid */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.key}
            className="bg-white rounded-xl border border-gray-100 p-4"
          >
            <ArticuloColumn
              config={column}
              articulos={articulosPorEstado[column.key] || []}
              onArticuloClick={handleArticuloClick}
              showFilter={column.key === "rechazados"}
            />
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      {showModal && articuloSeleccionado && !loadingArticulo && (
        <ArticuloModal
          articulo={articuloSeleccionado}
          isOpen={showModal}
          onClose={handleCloseModal}
          onExpand={handleExpand}
          onEdit={handleEdit}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
};

export default SupervisorMisArticulosView;
