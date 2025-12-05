import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  Code,
  ChevronDown,
  Type,
  Palette,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useArticulo } from "../hooks/useArticulos";
import { useBasePath } from "../hooks/useBasePath";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import type {
  Etiqueta,
  TipoCaso,
  Visibilidad,
  CrearVersionRequest,
  ActualizarArticuloRequest,
} from "../types/articulo";
import {
  ETIQUETA_OPTIONS,
  TIPO_CASO_OPTIONS,
  VISIBILIDAD_OPTIONS,
} from "../types/articulo";

const EditarArticuloPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buildPath } = useBasePath();
  const userId = useUserId();
  const articuloId = id ? parseInt(id, 10) : null;

  const { data: articulo, loading: loadingArticulo } = useArticulo(articuloId);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    resumen: "",
    categoria: "TROUBLESHOOTING" as Etiqueta,
    tipoCaso: "TODOS" as TipoCaso,
    visibilidad: "AGENTE" as Visibilidad,
    contenido: "",
    notaCambio: "",
    vigenteDesde: "",
    vigenteHasta: "",
  });

  // Cargar datos del artículo cuando se obtenga
  useEffect(() => {
    if (articulo) {
      setFormData({
        titulo: articulo.titulo || "",
        resumen: articulo.resumen || "",
        categoria: articulo.etiqueta || "TROUBLESHOOTING",
        tipoCaso: articulo.tipoCaso || "TODOS",
        visibilidad: articulo.visibilidad || "AGENTE",
        contenido: articulo.contenidoVersionVigente || "",
        notaCambio: "",
        vigenteDesde: articulo.vigenteDesde
          ? articulo.vigenteDesde.split("T")[0]
          : "",
        vigenteHasta: articulo.vigenteHasta
          ? articulo.vigenteHasta.split("T")[0]
          : "",
      });
    }
  }, [articulo]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback(
    async (asBorrador: boolean) => {
      if (!articuloId) return;

      if (!formData.titulo.trim()) {
        showToast("El título es requerido", "warning");
        return;
      }
      if (!formData.contenido.trim()) {
        showToast("El contenido es requerido", "warning");
        return;
      }
      if (!formData.notaCambio.trim()) {
        showToast(
          "La nota de cambio es requerida para una nueva versión",
          "warning"
        );
        return;
      }

      setLoading(true);
      try {
        // 1. Actualizar datos del artículo si cambiaron
        const updateRequest: ActualizarArticuloRequest = {
          titulo: formData.titulo,
          resumen: formData.resumen || undefined,
          etiqueta: formData.categoria,
          tipoCaso: formData.tipoCaso,
          visibilidad: formData.visibilidad,
          idUltimoEditor: userId,
        };

        if (formData.vigenteDesde) {
          updateRequest.vigenteDesde = new Date(
            formData.vigenteDesde + "T00:00:00"
          ).toISOString();
        }
        if (formData.vigenteHasta) {
          updateRequest.vigenteHasta = new Date(
            formData.vigenteHasta + "T23:59:59"
          ).toISOString();
        }

        await articuloService.actualizarArticulo(articuloId, updateRequest);

        // 2. Crear nueva versión
        const versionRequest: CrearVersionRequest = {
          contenido: formData.contenido,
          notaCambio: formData.notaCambio,
          idCreador: userId,
          origen: "MANUAL",
        };

        const nuevaVersion = await articuloService.crearVersion(
          articuloId,
          versionRequest
        );

        // 3. Si no es borrador, proponer para revisión
        if (!asBorrador) {
          await articuloService.proponerVersion(
            articuloId,
            nuevaVersion.idArticuloVersion
          );
          showToast(
            "Nueva versión creada y propuesta para revisión",
            "success"
          );
        } else {
          showToast("Nueva versión guardada como borrador", "success");
        }

        // Navegar de vuelta
        navigate(buildPath(`/articulo/${articuloId}`));
      } catch (error) {
        console.error("Error al actualizar artículo:", error);
        showToast("Error al guardar los cambios", "error");
      } finally {
        setLoading(false);
      }
    },
    [articuloId, formData, userId, navigate, buildPath]
  );

  // Toolbar button component
  const ToolbarBtn: React.FC<{ icon: React.ReactNode; title?: string }> = ({
    icon,
    title,
  }) => (
    <button
      type="button"
      title={title}
      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
    >
      {icon}
    </button>
  );

  if (loadingArticulo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!articulo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Artículo no encontrado
          </h2>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">Editar Artículo</h1>
              <p className="text-sm text-gray-500">
                {articulo.codigo} - Creando versión{" "}
                {(articulo.versionVigente || 1) + 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? "Guardando..." : "Guardar borrador"}</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              <span>{loading ? "Enviando..." : "Proponer cambios"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Nota de cambio - Importante para nueva versión */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Nota de cambio (requerido) *
            </label>
            <input
              type="text"
              placeholder="Describe brevemente qué cambios realizaste en esta versión..."
              value={formData.notaCambio}
              onChange={(e) => handleChange("notaCambio", e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
            />
            <p className="text-xs text-blue-600 mt-1">
              Esta nota se guardará en el historial de versiones del artículo.
            </p>
          </div>

          {/* Primera fila: Categoría, Tipo Caso, Visibilidad */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={formData.categoria}
                  onChange={(e) => handleChange("categoria", e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                >
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
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tipo de Caso
              </label>
              <div className="relative">
                <select
                  value={formData.tipoCaso}
                  onChange={(e) => handleChange("tipoCaso", e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                >
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
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Visibilidad
              </label>
              <div className="relative">
                <select
                  value={formData.visibilidad}
                  onChange={(e) => handleChange("visibilidad", e.target.value)}
                  className="w-full appearance-none bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
                >
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
            </div>
          </div>

          {/* Segunda fila: Vigencia */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Vigente desde
              </label>
              <input
                type="date"
                value={formData.vigenteDesde}
                onChange={(e) => handleChange("vigenteDesde", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Vigente hasta
              </label>
              <input
                type="date"
                value={formData.vigenteHasta}
                onChange={(e) => handleChange("vigenteHasta", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Título *</label>
            <input
              type="text"
              placeholder="Título del artículo..."
              value={formData.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {/* Resumen */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">Resumen</label>
            <input
              type="text"
              placeholder="Breve descripción del artículo..."
              value={formData.resumen}
              onChange={(e) => handleChange("resumen", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Contenido *
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                <ToolbarBtn icon={<Bold size={16} />} title="Negrita" />
                <ToolbarBtn icon={<Italic size={16} />} title="Cursiva" />
                <ToolbarBtn icon={<Underline size={16} />} title="Subrayado" />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarBtn icon={<Type size={16} />} title="Fuente" />
                <ToolbarBtn icon={<Palette size={16} />} title="Color" />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarBtn
                  icon={<AlignLeft size={16} />}
                  title="Alinear izquierda"
                />
                <ToolbarBtn icon={<AlignCenter size={16} />} title="Centrar" />
                <ToolbarBtn
                  icon={<AlignRight size={16} />}
                  title="Alinear derecha"
                />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarBtn icon={<List size={16} />} title="Lista" />
                <ToolbarBtn
                  icon={<ListOrdered size={16} />}
                  title="Lista numerada"
                />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarBtn icon={<Table size={16} />} title="Tabla" />
                <ToolbarBtn icon={<Link size={16} />} title="Enlace" />
                <ToolbarBtn icon={<Image size={16} />} title="Imagen" />
                <ToolbarBtn icon={<Code size={16} />} title="Código" />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarBtn icon={<RotateCcw size={16} />} title="Deshacer" />
                <ToolbarBtn icon={<RotateCw size={16} />} title="Rehacer" />
              </div>

              {/* Editor Area */}
              <textarea
                value={formData.contenido}
                onChange={(e) => handleChange("contenido", e.target.value)}
                placeholder="Escribe el contenido del artículo aquí..."
                className="w-full min-h-[400px] p-4 text-sm outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarArticuloPage;
