import React, { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  User,
  GripVertical,
  X,
  Check,
  Archive,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useArticulos, useArticulo } from "../hooks/useArticulos";
import { useBasePath } from "../hooks/useBasePath";
import { useUserId } from "../../../context";
import articuloService from "../services/articuloService";
import showToast from "../../../services/notification";
import ArticuloModal from "./ArticuloModal";
import BuscadorArticulos from "./BuscadorArticulos";
import type {
  ArticuloResumenResponse,
  EstadoArticulo,
} from "../types/articulo";

interface ColumnConfig {
  key: string;
  title: string;
  estados: EstadoArticulo[];
  color: string;
  bgColor: string;
  borderColor: string;
  acceptsFrom: string[];
  icon: React.ReactNode;
  dropMessage: string;
  targetEstado: EstadoArticulo; // Estado al que cambia el artículo
}

const COLUMNS: ColumnConfig[] = [
  {
    key: "rechazados",
    title: "Rechazados",
    estados: ["RECHAZADO"],
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-400",
    acceptsFrom: ["propuestos"],
    icon: <X size={16} />,
    dropMessage: "Rechazar artículo",
    targetEstado: "RECHAZADO",
  },
  {
    key: "propuestos",
    title: "Propuestos",
    estados: ["PROPUESTO"],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    acceptsFrom: ["rechazados"],
    icon: <GripVertical size={16} />,
    dropMessage: "Re-proponer artículo",
    targetEstado: "PROPUESTO",
  },
  {
    key: "aceptados",
    title: "Aceptados",
    estados: ["PUBLICADO"],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    acceptsFrom: ["propuestos"],
    icon: <Check size={16} />,
    dropMessage: "Aprobar y publicar",
    targetEstado: "PUBLICADO",
  },
  {
    key: "archivados",
    title: "Archivados",
    estados: ["ARCHIVADO"],
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-400",
    acceptsFrom: ["aceptados", "rechazados"],
    icon: <Archive size={16} />,
    dropMessage: "Archivar artículo",
    targetEstado: "ARCHIVADO",
  },
];

const ESTADO_LABELS: Record<string, string> = {
  RECHAZADO: "Rechazado",
  PROPUESTO: "Propuesto",
  PUBLICADO: "Aprobado",
  DEPRECADO: "Vencido",
  ARCHIVADO: "Archivado",
  BORRADOR: "Borrador",
};

const ESTADO_COLORS: Record<string, string> = {
  RECHAZADO: "text-red-500",
  PROPUESTO: "text-amber-600",
  PUBLICADO: "text-emerald-500",
  DEPRECADO: "text-orange-500",
  ARCHIVADO: "text-slate-500",
  BORRADOR: "text-blue-500",
};

// ============ PROCESSING MODAL ============
interface ProcessingModalProps {
  isOpen: boolean;
  articulo: ArticuloResumenResponse | null;
  action: string;
  status: "processing" | "success" | "error";
  errorMessage?: string;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  articulo,
  action,
  status,
  errorMessage,
}) => {
  if (!isOpen || !articulo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              status === "processing"
                ? "bg-blue-100"
                : status === "success"
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            {status === "processing" && (
              <Loader2 size={32} className="text-blue-600 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 size={32} className="text-green-600" />
            )}
            {status === "error" && (
              <AlertCircle size={32} className="text-red-600" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {status === "processing" && "Procesando cambio..."}
            {status === "success" && "¡Cambio exitoso!"}
            {status === "error" && "Error al procesar"}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-2">
            {status === "processing" && (
              <>
                Cambiando estado de{" "}
                <span className="font-medium text-gray-800">
                  "{articulo.titulo}"
                </span>
              </>
            )}
            {status === "success" && (
              <>
                El artículo ha sido{" "}
                <span className="font-medium text-green-600">{action}</span>{" "}
                correctamente
              </>
            )}
            {status === "error" && (
              <span className="text-red-600">
                {errorMessage || "No se pudo completar la operación"}
              </span>
            )}
          </p>

          {/* Action badge */}
          {status === "processing" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mt-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {action}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ CARD COMPONENT ============
interface ArticuloCardProps {
  articulo: ArticuloResumenResponse;
  columnKey: string;
  onDragStart: (articulo: ArticuloResumenResponse, columnKey: string) => void;
  onClick: () => void;
  isDragging: boolean;
  isMoving: boolean;
}

const ArticuloCard = memo<ArticuloCardProps>(
  ({ articulo, columnKey, onDragStart, onClick, isDragging, isMoving }) => {
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", articulo.idArticulo.toString());
      onDragStart(articulo, columnKey);
    };

    return (
      <div
        draggable={!isMoving}
        onDragStart={handleDragStart}
        onClick={onClick}
        className={`
        bg-white rounded-lg border p-3 select-none cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        ${
          isDragging
            ? "opacity-40 scale-95 border-blue-500 shadow-lg ring-2 ring-blue-400"
            : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
        }
        ${isMoving ? "opacity-50 pointer-events-none animate-pulse" : ""}
      `}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <GripVertical
            size={12}
            className={`transition-colors ${
              isDragging ? "text-blue-500" : "text-gray-300"
            }`}
          />
          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <User size={10} className="text-gray-500" />
          </div>
          <span className="text-xs text-blue-600 truncate flex-1">
            {articulo.nombrePropietario}
          </span>
          {isMoving && (
            <Loader2 size={12} className="animate-spin text-blue-500" />
          )}
        </div>
        <h4 className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">
          {articulo.titulo}
        </h4>
        <span
          className={`text-xs font-medium ${
            ESTADO_COLORS[articulo.estado] || "text-gray-500"
          }`}
        >
          {ESTADO_LABELS[articulo.estado] || articulo.estado}
        </span>
      </div>
    );
  }
);
ArticuloCard.displayName = "ArticuloCard";

// ============ COLUMN COMPONENT ============
interface ArticuloColumnProps {
  config: ColumnConfig;
  articulos: ArticuloResumenResponse[];
  onArticuloClick: (a: ArticuloResumenResponse) => void;
  onDragStart: (a: ArticuloResumenResponse, col: string) => void;
  onDrop: (target: string) => void;
  isDragOver: boolean;
  canAccept: boolean;
  draggingId: number | null;
  movingId: number | null;
  setDragOverColumn: (col: string | null) => void;
}

const ArticuloColumn = memo<ArticuloColumnProps>(
  ({
    config,
    articulos,
    onArticuloClick,
    onDragStart,
    onDrop,
    isDragOver,
    canAccept,
    draggingId,
    movingId,
    setDragOverColumn,
  }) => {
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = canAccept ? "move" : "none";
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverColumn(config.key);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragOverColumn(null);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverColumn(null);
      if (canAccept) {
        onDrop(config.key);
      }
    };

    return (
      <div
        className={`
        flex flex-col h-full rounded-xl p-3 transition-all duration-200 ease-out
        ${
          isDragOver && canAccept
            ? `border-3 border-dashed ${config.borderColor} ${config.bgColor} shadow-lg scale-[1.02]`
            : isDragOver && !canAccept
            ? "border-3 border-dashed border-red-300 bg-red-50/50"
            : "border-2 border-transparent"
        }
      `}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`${config.color} transition-transform ${
                isDragOver && canAccept ? "scale-125" : ""
              }`}
            >
              {config.icon}
            </span>
            <h3 className="font-semibold text-gray-700">{config.title}</h3>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${
              isDragOver && canAccept
                ? `${config.bgColor} ${config.color}`
                : "text-gray-500 bg-gray-100"
            }`}
          >
            {articulos.length}
          </span>
        </div>

        {/* Drop Zone Indicator */}
        {isDragOver && canAccept && (
          <div
            className={`mb-3 p-3 rounded-lg border-2 border-dashed ${config.borderColor} ${config.bgColor} text-center animate-pulse`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className={config.color} />
              <span className={`text-sm font-semibold ${config.color}`}>
                {config.dropMessage}
              </span>
            </div>
          </div>
        )}

        {isDragOver && !canAccept && (
          <div className="mb-3 p-3 rounded-lg border-2 border-dashed border-red-300 bg-red-100/50 text-center">
            <span className="text-xs font-medium text-red-500">
              ✕ No se puede mover aquí
            </span>
          </div>
        )}

        {/* Cards List */}
        <div className="flex-1 space-y-2 overflow-y-auto min-h-[150px] max-h-[450px] pr-1">
          {articulos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <Database size={28} className="mb-2 opacity-50" />
              <span className="text-sm">Sin artículos</span>
            </div>
          ) : (
            articulos.map((a) => (
              <ArticuloCard
                key={a.idArticulo}
                articulo={a}
                columnKey={config.key}
                onDragStart={onDragStart}
                onClick={() => onArticuloClick(a)}
                isDragging={draggingId === a.idArticulo}
                isMoving={movingId === a.idArticulo}
              />
            ))
          )}
        </div>
      </div>
    );
  }
);
ArticuloColumn.displayName = "ArticuloColumn";

// ============ SKELETON LOADING ============
const SkeletonColumn: React.FC = () => (
  <div className="bg-white rounded-xl border p-3 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-8 bg-gray-200 rounded-full" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg" />
      ))}
    </div>
  </div>
);

// ============ MAIN COMPONENT ============
const SupervisorTodosArticulosView: React.FC = () => {
  const userId = useUserId();
  const navigate = useNavigate();
  const { buildPath } = useBasePath();

  // Estado local de artículos para actualización optimista
  const [localArticulos, setLocalArticulos] = useState<
    ArticuloResumenResponse[]
  >([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Estado del drag & drop
  const [dragItem, setDragItem] = useState<{
    articulo: ArticuloResumenResponse;
    sourceColumn: string;
  } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);

  // Estado del modal de procesamiento
  const [processingModal, setProcessingModal] = useState<{
    isOpen: boolean;
    articulo: ArticuloResumenResponse | null;
    action: string;
    status: "processing" | "success" | "error";
    errorMessage?: string;
  }>({
    isOpen: false,
    articulo: null,
    action: "",
    status: "processing",
  });

  // Estado del modal de artículo
  const [showModal, setShowModal] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState<number | null>(
    null
  );

  // Obtener artículos del servidor
  const { data, loading } = useArticulos({
    soloPublicados: false,
    ordenarPor: "actualizadoEn",
    direccion: "DESC",
    pagina: 0,
    tamanoPagina: 100,
  });

  // Sincronizar datos del servidor con estado local
  React.useEffect(() => {
    if (data?.contenido && !isInitialized) {
      setLocalArticulos(data.contenido);
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  // También actualizar cuando hay refetch explícito
  React.useEffect(() => {
    if (data?.contenido && isInitialized && !movingId) {
      setLocalArticulos(data.contenido);
    }
  }, [data?.contenido]);

  const { data: articuloSeleccionado, loading: loadingArticulo } =
    useArticulo(selectedArticuloId);

  // Agrupar por estado usando el estado local
  const articulosPorEstado = useMemo(() => {
    const grouped: Record<string, ArticuloResumenResponse[]> = {
      rechazados: [],
      propuestos: [],
      aceptados: [],
      archivados: [],
    };

    localArticulos.forEach((a) => {
      if (a.estado === "RECHAZADO") grouped.rechazados.push(a);
      else if (a.estado === "PROPUESTO") grouped.propuestos.push(a);
      else if (a.estado === "PUBLICADO") grouped.aceptados.push(a);
      else if (a.estado === "ARCHIVADO") grouped.archivados.push(a);
    });

    return grouped;
  }, [localArticulos]);

  // Verificar si un drop es válido
  const canAcceptDrop = useCallback(
    (targetColumn: string): boolean => {
      if (!dragItem) return false;
      if (dragItem.sourceColumn === targetColumn) return false;
      const column = COLUMNS.find((c) => c.key === targetColumn);
      return column?.acceptsFrom.includes(dragItem.sourceColumn) || false;
    },
    [dragItem]
  );

  // Handler para inicio de drag
  const handleDragStart = useCallback(
    (articulo: ArticuloResumenResponse, sourceColumn: string) => {
      setDragItem({ articulo, sourceColumn });
    },
    []
  );

  // Handler para fin de drag
  const handleDragEnd = useCallback(() => {
    setDragItem(null);
    setDragOverColumn(null);
  }, []);

  // Obtener el nombre de la acción
  const getActionName = (targetColumn: string): string => {
    const actions: Record<string, string> = {
      rechazados: "rechazado",
      propuestos: "re-propuesto",
      aceptados: "aprobado",
      archivados: "archivado",
    };
    return actions[targetColumn] || "procesado";
  };

  // Handler para drop con actualización optimista
  const handleDrop = useCallback(
    async (targetColumn: string) => {
      if (!dragItem) return;
      if (dragItem.sourceColumn === targetColumn) {
        setDragItem(null);
        return;
      }
      if (!canAcceptDrop(targetColumn)) {
        showToast("No se puede mover a esta columna", "warning");
        setDragItem(null);
        return;
      }

      const { articulo, sourceColumn } = dragItem;
      const targetConfig = COLUMNS.find((c) => c.key === targetColumn);
      if (!targetConfig) return;

      // Limpiar drag state
      setDragItem(null);
      setDragOverColumn(null);
      setMovingId(articulo.idArticulo);

      // Mostrar modal de procesamiento
      const actionName = getActionName(targetColumn);
      setProcessingModal({
        isOpen: true,
        articulo,
        action: actionName,
        status: "processing",
      });

      // ACTUALIZACIÓN OPTIMISTA: Mover el artículo inmediatamente en el UI
      const nuevoEstado = targetConfig.targetEstado;
      setLocalArticulos((prev) =>
        prev.map((a) =>
          a.idArticulo === articulo.idArticulo
            ? { ...a, estado: nuevoEstado }
            : a
        )
      );

      try {
        // Obtener versiones del artículo
        const versiones = await articuloService.obtenerVersiones(
          articulo.idArticulo
        );
        const versionActiva =
          versiones.find((v) => v.esVigente) || versiones[0];

        if (!versionActiva) {
          throw new Error("El artículo no tiene versiones");
        }

        // Ejecutar la acción correspondiente
        if (targetColumn === "rechazados" && sourceColumn === "propuestos") {
          await articuloService.rechazarVersion(
            articulo.idArticulo,
            versionActiva.idArticuloVersion
          );
        } else if (
          targetColumn === "aceptados" &&
          sourceColumn === "propuestos"
        ) {
          await articuloService.publicarArticulo(
            articulo.idArticulo,
            versionActiva.idArticuloVersion,
            {
              visibilidad: articulo.visibilidad,
            }
          );
        } else if (targetColumn === "archivados") {
          await articuloService.archivarVersion(
            articulo.idArticulo,
            versionActiva.idArticuloVersion
          );
        } else if (
          targetColumn === "propuestos" &&
          sourceColumn === "rechazados"
        ) {
          await articuloService.proponerVersion(
            articulo.idArticulo,
            versionActiva.idArticuloVersion
          );
        }

        // Mostrar éxito
        setProcessingModal((prev) => ({ ...prev, status: "success" }));

        // Cerrar modal después de un momento
        setTimeout(() => {
          setProcessingModal((prev) => ({ ...prev, isOpen: false }));
          setMovingId(null);
        }, 1200);
      } catch (error) {
        console.error("Error:", error);

        // REVERTIR: Si falla, volver al estado original
        setLocalArticulos((prev) =>
          prev.map((a) =>
            a.idArticulo === articulo.idArticulo
              ? { ...a, estado: articulo.estado }
              : a
          )
        );

        // Mostrar error
        setProcessingModal((prev) => ({
          ...prev,
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : "Error desconocido",
        }));

        // Cerrar modal después de un momento
        setTimeout(() => {
          setProcessingModal((prev) => ({ ...prev, isOpen: false }));
          setMovingId(null);
        }, 2000);
      }
    },
    [dragItem, canAcceptDrop]
  );

  // Handlers del modal de artículo
  const handleArticuloClick = useCallback((a: ArticuloResumenResponse) => {
    setSelectedArticuloId(a.idArticulo);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedArticuloId(null);
  }, []);

  const handleExpand = useCallback(() => {
    if (selectedArticuloId)
      navigate(buildPath(`/articulo/${selectedArticuloId}`));
  }, [selectedArticuloId, navigate, buildPath]);

  const handleEdit = useCallback(() => {
    if (selectedArticuloId)
      navigate(buildPath(`/editar/${selectedArticuloId}`));
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
        showToast("Feedback enviado", "success");
      } catch {
        showToast("Error al enviar feedback", "error");
      }
    },
    [selectedArticuloId, articuloSeleccionado, userId]
  );

  const handleSearchSelect = useCallback((a: ArticuloResumenResponse) => {
    setSelectedArticuloId(a.idArticulo);
    setShowModal(true);
  }, []);

  // Loading state
  if (loading && !isInitialized) {
    return (
      <div className="p-4">
        <div className="mb-4 h-10 bg-gray-200 rounded-lg animate-pulse w-full" />
        <div className="grid grid-cols-4 gap-4">
          <SkeletonColumn />
          <SkeletonColumn />
          <SkeletonColumn />
          <SkeletonColumn />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" onDragEnd={handleDragEnd}>
      {/* Modal de procesamiento */}
      <ProcessingModal
        isOpen={processingModal.isOpen}
        articulo={processingModal.articulo}
        action={processingModal.action}
        status={processingModal.status}
        errorMessage={processingModal.errorMessage}
      />

      {/* Buscador */}
      <div className="mb-4">
        <BuscadorArticulos
          onArticuloSeleccionado={handleSearchSelect}
          placeholder="Buscar artículos..."
        />
      </div>

      {/* Instrucciones */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
        <GripVertical size={18} className="text-blue-500" />
        <div>
          <span className="text-sm font-medium text-blue-700">
            Arrastra y suelta
          </span>
          <span className="text-sm text-blue-600 ml-2">
            para cambiar el estado de los artículos entre columnas
          </span>
        </div>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <ArticuloColumn
              config={col}
              articulos={articulosPorEstado[col.key] || []}
              onArticuloClick={handleArticuloClick}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              isDragOver={dragOverColumn === col.key}
              canAccept={canAcceptDrop(col.key)}
              draggingId={dragItem?.articulo.idArticulo || null}
              movingId={movingId}
              setDragOverColumn={setDragOverColumn}
            />
          </div>
        ))}
      </div>

      {/* Modal de artículo */}
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

export default SupervisorTodosArticulosView;
