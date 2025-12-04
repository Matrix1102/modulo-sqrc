import React, { useState, useEffect, useCallback } from "react";
import { X, Search, FileClock, Eye, RotateCcw } from "lucide-react";
import { Badge } from "../../../components/ui/Badge"; // Reutilizamos tu Badge existente
import showToast from "../../../services/notification";
import showConfirm from "../../../services/confirm";
import { encuestaService } from "../services/encuestaService";


interface TemplateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateHistoryModal: React.FC<TemplateHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<string | number | null>(null);

  // (removed local mock data — modal now loads templates from the backend)

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await encuestaService.plantillasList();
      setItems(data || []);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isOpen) return;
    // guard: only load when modal opens
    (async () => {
      if (!mounted) return;
      await load();
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen, load]);

  const handleReactivate = async (item: any) => {
    const id = item.templateId || item.id;
    setReactivatingId(id);
    try {
      await encuestaService.plantillaReactivate(id);
      // refresh list after successful reactivation
      await load();
      showToast('Plantilla reactivada', 'success');
    } catch (err) {
      console.error("Error reactivating plantilla:", err);
      showToast('Error al reactivar la plantilla', 'error');
    } finally {
      setReactivatingId(null);
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [_previewLoading, setPreviewLoading] = useState(false);

  const handleViewDesign = async (item: any) => {
    const id = item.templateId || item.id;
    setPreviewLoading(true);
    try {
      // try to fetch full plantilla detail; fallback to item if endpoint missing
      const detail = await encuestaService.plantillaGet(id).catch(() => item);
      setPreviewItem(detail || item);
      setPreviewOpen(true);
    } catch (err) {
      console.error('Error loading plantilla detail', err);
      showToast('Error cargando vista previa', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredData = (items || []).filter((item) =>
    ((item.nombre || item.nombrePlantilla || "") as string)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    /* --- 1. OVERLAY --- */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* --- 2. CONTENEDOR DEL MODAL --- */}
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER FIJO --- */}
        <div className="p-6 border-b border-gray-100 bg-white z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <FileClock className="text-blue-600" /> Historial de Versiones
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta y restaura versiones anteriores de tus encuestas.
            </p>
          </div>

          {/* Buscador y Cerrar */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* --- PREVIEW MODAL --- */}
        {previewOpen && previewItem && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{previewItem.nombre || previewItem.nombrePlantilla || 'Vista previa'}</h3>
                  <p className="text-sm text-gray-500">{previewItem.descripcion || ''}</p>
                </div>
                <button className="p-1 text-gray-500" onClick={() => setPreviewOpen(false)}><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">Alcance: <strong>{previewItem.alcanceEvaluacion || previewItem.tipo || '-'}</strong></div>

                <div>
                  <h4 className="font-semibold mb-2">Preguntas</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    {(previewItem.preguntas || previewItem.preguntaList || []).map((q: any, i: number) => (
                      <li key={q.id || i} className="text-sm text-gray-700">
                        <div className="font-medium">{q.texto || q.enunciado || q.label || 'Pregunta'}</div>
                        <div className="text-xs text-gray-500">Tipo: {q.tipo || q.type || '-'}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CUERPO SCROLLEABLE (TABLA) --- */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Nombre / Versión</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Creado el</th>
                  <th className="p-4">Autor</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  // skeleton rows
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`tpl-skel-${i}`} className="animate-pulse">
                      <td className="p-4">
                        <div className="h-4 bg-gray-100 rounded w-40 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-20"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                      </td>
                      <td className="p-4 text-gray-500">
                        <div className="h-4 bg-gray-100 rounded w-28"></div>
                      </td>
                      <td className="p-4 text-gray-500">
                        <div className="h-4 bg-gray-100 rounded w-28"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-gray-100 rounded w-16"></div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="h-8 w-24 bg-gray-100 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredData.map((item) => (
                  <tr
                    key={item.templateId || item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-800">
                        {item.nombre || item.nombrePlantilla || "-"}
                      </div>
                      <span className="text-xs text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block border border-blue-100">
                        {item.version || item.templateId || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                        {item.alcanceEvaluacion || item.tipo || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{item.fechaCreacion || item.fechaModificacion || "-"}</td>
                    <td className="p-4 text-gray-500">{item.autor || item.creadoPor || "-"}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          (item.estado || "").toUpperCase() === "ACTIVA" ? "success" : "neutral"
                        }
                      >
                        {item.estado || "-"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          title="Ver diseño"
                          onClick={() => void handleViewDesign(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        >
                          <Eye size={18} />
                        </button>

                        {((item.estado || "").toUpperCase() === "INACTIVA") && (
                          <button
                            title="Restaurar esta versión"
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100 disabled:opacity-60"
                            onClick={async () => {
                              const ok = await showConfirm(`¿Deseas restaurar la versión ${item.version || item.templateId || "?"}?`, 'Confirmar');
                              if (ok) {
                                void handleReactivate(item);
                              }
                            }}
                            disabled={reactivatingId === (item.templateId || item.id)}
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No se encontraron plantillas que coincidan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FOOTER FIJO --- */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition border border-transparent hover:border-gray-300"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
