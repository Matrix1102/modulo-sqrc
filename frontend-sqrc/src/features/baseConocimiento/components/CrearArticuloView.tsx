import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
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
  FileText,
  Upload,
} from "lucide-react";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import type {
  CrearArticuloRequest,
  Etiqueta,
  TipoCaso,
  Visibilidad,
  ArticuloGeneradoIA,
} from "../types/articulo";
import {
  ETIQUETA_OPTIONS,
  TIPO_CASO_OPTIONS,
  VISIBILIDAD_OPTIONS,
} from "../types/articulo";
import GenerarDesdeDocumentacionModal from "./GenerarDesdeDocumentacionModal";
import GenerarDesdeDocumentoModal from "./GenerarDesdeDocumentoModal";

interface CrearArticuloViewProps {
  onArticuloCreated?: () => void;
}

export interface CrearArticuloViewRef {
  guardarBorrador: () => Promise<boolean>;
  tieneContenido: () => boolean;
}

const CrearArticuloView = forwardRef<
  CrearArticuloViewRef,
  CrearArticuloViewProps
>(({ onArticuloCreated }, ref) => {
  const userId = useUserId();
  const [loading, setLoading] = useState(false);
  const [showDocumentacionModal, setShowDocumentacionModal] = useState(false);
  const [showDocumentoModal, setShowDocumentoModal] = useState(false);

  const [formData, setFormData] = useState({
    categoria: "TROUBLESHOOTING" as Etiqueta,
    tipoCaso: "TODOS" as TipoCaso,
    visibilidad: "AGENTE" as Visibilidad,
    propietario: "Andre Cuenca",
    etiquetas: "",
    titulo: "",
    resumen: "",
    contenido: "",
    notaCambio: "",
    vigenteDesde: new Date().toISOString().split("T")[0], // Fecha actual
    vigenteHasta: "", // Opcional
  });

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Cargar artículo generado desde sessionStorage (viene de DocumentacionTab)
  useEffect(() => {
    const stored = sessionStorage.getItem("articuloGeneradoIA");
    if (stored) {
      try {
        const articulo: ArticuloGeneradoIA = JSON.parse(stored);
        setFormData((prev) => ({
          ...prev,
          titulo: articulo.titulo || prev.titulo,
          resumen: articulo.resumen || prev.resumen,
          contenido: articulo.contenido || prev.contenido,
          categoria: articulo.etiqueta || prev.categoria,
          tipoCaso: articulo.tipoCaso || prev.tipoCaso,
          visibilidad: articulo.visibilidad || prev.visibilidad,
          etiquetas: articulo.tags || prev.etiquetas,
          notaCambio: articulo.notaCambio || "Generado con IA - Gemini 2.5 Flash",
        }));
        // Limpiar sessionStorage después de cargar
        sessionStorage.removeItem("articuloGeneradoIA");
      } catch (e) {
        console.error("Error parsing articuloGeneradoIA from sessionStorage:", e);
        sessionStorage.removeItem("articuloGeneradoIA");
      }
    }
  }, []);

  // Callback cuando la IA genera el artículo (desde los modales locales)
  const handleArticuloGenerado = useCallback((articulo: ArticuloGeneradoIA) => {
    setFormData((prev) => ({
      ...prev,
      titulo: articulo.titulo || prev.titulo,
      resumen: articulo.resumen || prev.resumen,
      contenido: articulo.contenido || prev.contenido,
      categoria: articulo.etiqueta || prev.categoria,
      tipoCaso: articulo.tipoCaso || prev.tipoCaso,
      visibilidad: articulo.visibilidad || prev.visibilidad,
      etiquetas: articulo.tags || prev.etiquetas,
      notaCambio: articulo.notaCambio || "Generado con IA - Gemini 2.5 Flash",
    }));
  }, []);

  // Función para verificar si hay contenido para guardar
  const tieneContenido = useCallback(() => {
    return formData.titulo.trim() !== "" || formData.contenido.trim() !== "";
  }, [formData.titulo, formData.contenido]);

  // Función para guardar como borrador (puede ser llamada externamente)
  const guardarBorrador = useCallback(async (): Promise<boolean> => {
    // Solo guardar si hay título o contenido
    if (!tieneContenido()) {
      return false;
    }

    // Si no hay título, no podemos guardar
    if (!formData.titulo.trim()) {
      return false;
    }

    setLoading(true);
    try {
      const vigenteDesdeDate = formData.vigenteDesde
        ? new Date(formData.vigenteDesde + "T00:00:00").toISOString()
        : new Date().toISOString();

      const vigenteHastaDate = formData.vigenteHasta
        ? new Date(formData.vigenteHasta + "T23:59:59").toISOString()
        : undefined;

      const request: CrearArticuloRequest = {
        codigo: `KB-${Date.now()}`,
        titulo: formData.titulo,
        resumen: formData.resumen || undefined,
        etiqueta: formData.categoria,
        tipoCaso: formData.tipoCaso,
        visibilidad: formData.visibilidad,
        vigenteDesde: vigenteDesdeDate,
        vigenteHasta: vigenteHastaDate,
        idPropietario: userId,
        tags: formData.etiquetas || undefined,
        contenidoInicial: formData.contenido || "Contenido pendiente",
        notaCambioInicial: formData.notaCambio || "Borrador automático",
      };

      await articuloService.crearArticulo(request);

      // Reset form
      setFormData({
        categoria: "TROUBLESHOOTING",
        tipoCaso: "TODOS",
        visibilidad: "AGENTE",
        propietario: "Andre Cuenca",
        etiquetas: "",
        titulo: "",
        resumen: "",
        contenido: "",
        notaCambio: "",
        vigenteDesde: new Date().toISOString().split("T")[0],
        vigenteHasta: "",
      });

      showToast("Artículo guardado como borrador automáticamente", "info");
      return true;
    } catch (error) {
      console.error("Error al guardar borrador:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, userId, tieneContenido]);

  // Exponer funciones al componente padre
  useImperativeHandle(
    ref,
    () => ({
      guardarBorrador,
      tieneContenido,
    }),
    [guardarBorrador, tieneContenido]
  );

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
        // Construir fecha vigente desde con hora 00:00:00
        const vigenteDesdeDate = formData.vigenteDesde
          ? new Date(formData.vigenteDesde + "T00:00:00").toISOString()
          : new Date().toISOString();

        // Construir fecha vigente hasta con hora 23:59:59 (si se proporciona)
        const vigenteHastaDate = formData.vigenteHasta
          ? new Date(formData.vigenteHasta + "T23:59:59").toISOString()
          : undefined;

        const request: CrearArticuloRequest = {
          // Campos de la tabla articulos
          codigo: `KB-${Date.now()}`,
          titulo: formData.titulo,
          resumen: formData.resumen || undefined,
          etiqueta: formData.categoria,
          tipoCaso: formData.tipoCaso,
          visibilidad: formData.visibilidad,
          vigenteDesde: vigenteDesdeDate,
          vigenteHasta: vigenteHastaDate,
          idPropietario: userId,
          tags: formData.etiquetas || undefined,
          // Campos de la tabla articulo_versiones (primera versión)
          contenidoInicial: formData.contenido,
          notaCambioInicial: formData.notaCambio || "Versión inicial",
        };

        const nuevoArticulo = await articuloService.crearArticulo(request);

        if (!asBorrador) {
          // Proponer para revisión del supervisor - obtener versiones y proponer la primera
          const versiones = await articuloService.obtenerVersiones(
            nuevoArticulo.idArticulo
          );

          if (versiones.length > 0) {
            // La primera versión es la más reciente (ordenadas DESC por numeroVersion)
            const primeraVersion = versiones[0];
            await articuloService.proponerVersion(
              nuevoArticulo.idArticulo,
              primeraVersion.idArticuloVersion
            );
          }
          showToast(
            "Artículo propuesto para revisión del supervisor",
            "success"
          );
        } else {
          showToast("Artículo guardado como borrador", "success");
        }

        // Reset form
        setFormData({
          categoria: "TROUBLESHOOTING",
          tipoCaso: "TODOS",
          visibilidad: "AGENTE",
          propietario: "Andre Cuenca",
          etiquetas: "",
          titulo: "",
          resumen: "",
          contenido: "",
          notaCambio: "",
          vigenteDesde: new Date().toISOString().split("T")[0],
          vigenteHasta: "",
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
      tipoCaso: "TODOS",
      visibilidad: "AGENTE",
      propietario: "Andre Cuenca",
      etiquetas: "",
      titulo: "",
      resumen: "",
      contenido: "",
      notaCambio: "",
      vigenteDesde: new Date().toISOString().split("T")[0],
      vigenteHasta: "",
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
      {/* Primera fila: Categoría, Tipo Caso, Visibilidad, Propietario */}
      <div className="grid grid-cols-4 gap-4">
        {/* Categoría */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Categoría</label>
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

        {/* Tipo de Caso */}
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
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Segunda fila: Vigencia desde, Vigencia hasta, Etiquetas */}
      <div className="grid grid-cols-4 gap-4">
        {/* Vigente Desde */}
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

        {/* Vigente Hasta */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Vigente hasta
          </label>
          <input
            type="date"
            value={formData.vigenteHasta}
            onChange={(e) => handleChange("vigenteHasta", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            placeholder="Sin fecha límite"
          />
        </div>

        {/* Etiquetas */}
        <div className="col-span-2">
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

      {/* Tercera fila: Título y Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Título *</label>
          <input
            type="text"
            placeholder="Título del artículo..."
            value={formData.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Resumen</label>
          <input
            type="text"
            placeholder="Breve descripción del artículo..."
            value={formData.resumen}
            onChange={(e) => handleChange("resumen", e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Nota de cambio (para la versión) */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Nota de cambio
        </label>
        <input
          type="text"
          placeholder="Describe brevemente los cambios de esta versión..."
          value={formData.notaCambio}
          onChange={(e) => handleChange("notaCambio", e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
        />
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
          {/* Botón Generar desde Documentación */}
          <button
            type="button"
            onClick={() => setShowDocumentacionModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-purple-500/25"
          >
            <FileText size={16} />
            Desde Documentación
          </button>
          {/* Botón Generar desde Documento */}
          <button
            type="button"
            onClick={() => setShowDocumentoModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-500/25"
          >
            <Upload size={16} />
            Subir Documento
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
            className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Proponer"}
          </button>
        </div>
      </div>

      {/* Modal de Generación desde Documentación */}
      <GenerarDesdeDocumentacionModal
        isOpen={showDocumentacionModal}
        onClose={() => setShowDocumentacionModal(false)}
        idCreador={userId}
        onArticuloGenerado={handleArticuloGenerado}
      />

      {/* Modal de Generación desde Documento */}
      <GenerarDesdeDocumentoModal
        isOpen={showDocumentoModal}
        onClose={() => setShowDocumentoModal(false)}
        idCreador={userId}
        onArticuloGenerado={handleArticuloGenerado}
      />
    </div>
  );
});

CrearArticuloView.displayName = "CrearArticuloView";

export default CrearArticuloView;
