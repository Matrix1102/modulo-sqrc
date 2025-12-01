import React, { useState, useCallback } from "react";
import {
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
  Minus,
  Square,
  Circle,
  ChevronDown,
  Type,
  Palette,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import type {
  CrearArticuloRequest,
  Etiqueta,
  Visibilidad,
} from "../types/articulo";
import { ETIQUETA_OPTIONS, VISIBILIDAD_OPTIONS } from "../types/articulo";

interface CrearArticuloViewProps {
  onArticuloCreated?: () => void;
}

const CrearArticuloView: React.FC<CrearArticuloViewProps> = ({
  onArticuloCreated,
}) => {
  const userId = useUserId();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    categoria: "TROUBLESHOOTING" as Etiqueta,
    visibilidad: "AGENTE" as Visibilidad,
    propietario: "Andre Cuenca",
    etiquetas: "",
    titulo: "",
    resumen: "",
    contenido: "",
  });

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (asBorrador: boolean) => {
      if (!formData.titulo.trim()) {
        showToast("El título es requerido", "warning");
        return;
      }
      if (!formData.contenido.trim()) {
        showToast("El contenido es requerido", "warning");
        return;
      }

      setLoading(true);
      try {
        const request: CrearArticuloRequest = {
          codigo: `KB-${Date.now()}`,
          titulo: formData.titulo,
          resumen: formData.resumen,
          etiqueta: formData.categoria,
          visibilidad: formData.visibilidad,
          contenidoInicial: formData.contenido,
          idPropietario: userId,
          vigenteDesde: new Date().toISOString().split("T")[0],
        };

        const nuevoArticulo = await articuloService.crearArticulo(request);

        if (!asBorrador) {
          // Publicar directamente
          const versionVigente = await articuloService.obtenerVersionVigente(
            nuevoArticulo.idArticulo
          );
          await articuloService.publicarArticulo(
            nuevoArticulo.idArticulo,
            versionVigente.idArticuloVersion,
            {
              visibilidad: formData.visibilidad,
            }
          );
          showToast("Artículo creado y publicado correctamente", "success");
        } else {
          showToast("Artículo guardado como borrador", "success");
        }

        // Reset form
        setFormData({
          categoria: "TROUBLESHOOTING",
          visibilidad: "AGENTE",
          propietario: "Andre Cuenca",
          etiquetas: "",
          titulo: "",
          resumen: "",
          contenido: "",
        });

        onArticuloCreated?.();
      } catch (error) {
        console.error("Error al crear artículo:", error);
        showToast("Error al crear el artículo", "error");
      } finally {
        setLoading(false);
      }
    },
    [formData, userId, onArticuloCreated]
  );

  const handleCancel = useCallback(() => {
    setFormData({
      categoria: "TROUBLESHOOTING",
      visibilidad: "AGENTE",
      propietario: "Andre Cuenca",
      etiquetas: "",
      titulo: "",
      resumen: "",
      contenido: "",
    });
  }, []);

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

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Categoría */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Categoria</label>
          <div className="relative">
            <select
              value={formData.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            >
              <option value="">Todos</option>
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

        {/* Visibilidad */}
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

        {/* Propietario */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Propietario
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formData.propietario}
              onChange={(e) => handleChange("propietario", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
            <button className="absolute right-2 text-blue-500 hover:text-blue-700">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Etiquetas</label>
          <input
            type="text"
            placeholder="4g, lte, roaming..."
            value={formData.etiquetas}
            onChange={(e) => handleChange("etiquetas", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Title & Summary Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center">
          <input
            type="text"
            placeholder="Troubleshooting..."
            value={formData.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 text-center">
            Resumen
          </label>
          <input
            type="text"
            placeholder="Resolución del problema..."
            value={formData.resumen}
            onChange={(e) => handleChange("resumen", e.target.value)}
            className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Rich Text Editor */}
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
          <ToolbarBtn icon={<AlignRight size={16} />} title="Alinear derecha" />
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <ToolbarBtn icon={<List size={16} />} title="Lista" />
          <ToolbarBtn icon={<ListOrdered size={16} />} title="Lista numerada" />
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <ToolbarBtn icon={<Minus size={16} />} title="Línea" />
          <ToolbarBtn icon={<Square size={16} />} title="Cuadrado" />
          <ToolbarBtn icon={<Circle size={16} />} title="Círculo" />
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
          placeholder="Para resolver el troubleshooting, sigue los siguientes pasos:

1. Paso 1
2. Paso 2
3. Paso 3
4. Paso 4..."
          className="w-full min-h-[250px] p-4 text-sm outline-none resize-none placeholder:text-gray-400"
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Subir Archivo
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Pegar Imagen
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Borrador"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearArticuloView;
