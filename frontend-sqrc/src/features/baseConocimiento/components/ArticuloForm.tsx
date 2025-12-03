import React, { useState, useCallback } from "react";
import {
  Save,
  Send,
  X,
  FileText,
  Calendar,
  Tag,
  Eye,
  Folder,
  User,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import type {
  CrearArticuloRequest,
  Etiqueta,
  TipoCaso,
  Visibilidad,
} from "../types/articulo";
import {
  ETIQUETA_OPTIONS,
  TIPO_CASO_OPTIONS,
  VISIBILIDAD_OPTIONS,
} from "../types/articulo";
import { useUserId } from "../../../context";

interface ArticuloFormProps {
  initialData?: Partial<CrearArticuloRequest>;
  onSubmit: (data: CrearArticuloRequest, publicar: boolean) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export const ArticuloForm: React.FC<ArticuloFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const userId = useUserId();

  const [formData, setFormData] = useState<Partial<CrearArticuloRequest>>({
    codigo: "",
    titulo: "",
    resumen: "",
    etiqueta: "GUIAS",
    tipoCaso: "TODOS",
    visibilidad: "AGENTE",
    modulo: "",
    contenidoInicial: "",
    notaCambioInicial: "",
    vigenteDesde: new Date().toISOString().split("T")[0],
    idPropietario: userId, // Obtener del contexto de usuario
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: keyof CrearArticuloRequest, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo?.trim()) {
      newErrors.codigo = "El código es requerido";
    }
    if (!formData.titulo?.trim()) {
      newErrors.titulo = "El título es requerido";
    }
    if (!formData.contenidoInicial?.trim()) {
      newErrors.contenidoInicial = "El contenido es requerido";
    }
    if (!formData.etiqueta) {
      newErrors.etiqueta = "La categoría es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publicar: boolean) => {
    if (!validate()) return;

    await onSubmit(formData as CrearArticuloRequest, publicar);
  };

  // Toolbar actions para el editor de texto (simplificado)
  const insertFormatting = (format: string) => {
    const textarea = document.getElementById(
      "contenido-editor"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.contenidoInicial || "";
    const selectedText = text.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case "underline":
        newText = `<u>${selectedText}</u>`;
        cursorOffset = 3;
        break;
      case "h1":
        newText = `\n# ${selectedText}`;
        cursorOffset = 3;
        break;
      case "h2":
        newText = `\n## ${selectedText}`;
        cursorOffset = 4;
        break;
      case "h3":
        newText = `\n### ${selectedText}`;
        cursorOffset = 5;
        break;
      case "ul":
        newText = `\n- ${selectedText}`;
        cursorOffset = 3;
        break;
      case "ol":
        newText = `\n1. ${selectedText}`;
        cursorOffset = 4;
        break;
      case "quote":
        newText = `\n> ${selectedText}`;
        cursorOffset = 3;
        break;
      case "code":
        newText = selectedText.includes("\n")
          ? `\n\`\`\`\n${selectedText}\n\`\`\`\n`
          : `\`${selectedText}\``;
        cursorOffset = selectedText.includes("\n") ? 4 : 1;
        break;
      case "link":
        newText = `[${selectedText || "texto"}](url)`;
        cursorOffset = selectedText ? selectedText.length + 3 : 7;
        break;
      case "image":
        newText = `![${selectedText || "alt"}](url)`;
        cursorOffset = selectedText ? selectedText.length + 4 : 6;
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + newText + text.substring(end);
    handleChange("contenidoInicial", newContent);

    // Restaurar focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        start + cursorOffset + (selectedText.length || 0)
      );
    }, 0);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="text-primary-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEdit ? "Editar Artículo" : "Nuevo Artículo"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Actualiza la información del artículo"
                : "Crea un nuevo artículo para la base de conocimiento"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form body */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Código */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag size={14} />
              Código *
            </label>
            <input
              type="text"
              value={formData.codigo || ""}
              onChange={(e) => handleChange("codigo", e.target.value)}
              placeholder="KB-001"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                errors.codigo
                  ? "border-red-300 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
              }`}
            />
            {errors.codigo && (
              <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>
            )}
          </div>

          {/* Módulo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Folder size={14} />
              Módulo
            </label>
            <input
              type="text"
              value={formData.modulo || ""}
              onChange={(e) => handleChange("modulo", e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
            />
          </div>
        </div>

        {/* Título */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={14} />
            Título *
          </label>
          <input
            type="text"
            value={formData.titulo || ""}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder="Escribe el título del artículo..."
            className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
              errors.titulo
                ? "border-red-300 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
            }`}
          />
          {errors.titulo && (
            <p className="text-xs text-red-500 mt-1">{errors.titulo}</p>
          )}
        </div>

        {/* Resumen */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Resumen
          </label>
          <textarea
            value={formData.resumen || ""}
            onChange={(e) => handleChange("resumen", e.target.value)}
            placeholder="Breve descripción del contenido..."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all resize-none"
          />
        </div>

        {/* Categoría, Tipo caso, Visibilidad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag size={14} />
              Categoría *
            </label>
            <select
              value={formData.etiqueta || ""}
              onChange={(e) =>
                handleChange("etiqueta", e.target.value as Etiqueta)
              }
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all cursor-pointer ${
                errors.etiqueta
                  ? "border-red-300 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
              }`}
            >
              {ETIQUETA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Folder size={14} />
              Tipo de Caso
            </label>
            <select
              value={formData.tipoCaso || "TODOS"}
              onChange={(e) =>
                handleChange("tipoCaso", e.target.value as TipoCaso)
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all cursor-pointer"
            >
              {TIPO_CASO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Eye size={14} />
              Visibilidad
            </label>
            <select
              value={formData.visibilidad || "AGENTE"}
              onChange={(e) =>
                handleChange("visibilidad", e.target.value as Visibilidad)
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all cursor-pointer"
            >
              {VISIBILIDAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fechas de vigencia */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={14} />
              Vigente desde
            </label>
            <input
              type="date"
              value={formData.vigenteDesde || ""}
              onChange={(e) => handleChange("vigenteDesde", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={14} />
              Vigente hasta
            </label>
            <input
              type="date"
              value={formData.vigenteHasta || ""}
              onChange={(e) => handleChange("vigenteHasta", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
            />
          </div>
        </div>

        {/* Editor de contenido */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Contenido *
          </label>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-b-0 border-gray-200 rounded-t-lg">
            <button
              type="button"
              onClick={() => insertFormatting("bold")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Negrita"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("italic")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Cursiva"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("underline")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Subrayado"
            >
              <Underline size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
              type="button"
              onClick={() => insertFormatting("h1")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Título 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("h2")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Título 2"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("h3")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Título 3"
            >
              <Heading3 size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
              type="button"
              onClick={() => insertFormatting("ul")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Lista"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("ol")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Lista numerada"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("quote")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Cita"
            >
              <Quote size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
              type="button"
              onClick={() => insertFormatting("code")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Código"
            >
              <Code size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("link")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Enlace"
            >
              <Link size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("image")}
              className="p-2 text-gray-600 hover:bg-white hover:text-primary-600 rounded transition-colors"
              title="Imagen"
            >
              <Image size={16} />
            </button>
          </div>
          {/* Textarea */}
          <textarea
            id="contenido-editor"
            value={formData.contenidoInicial || ""}
            onChange={(e) => handleChange("contenidoInicial", e.target.value)}
            placeholder="Escribe el contenido del artículo aquí... Puedes usar Markdown para dar formato."
            rows={12}
            className={`w-full px-4 py-3 border border-t-0 rounded-b-lg text-sm outline-none transition-all resize-none font-mono ${
              errors.contenidoInicial
                ? "border-red-300 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
            }`}
          />
          {errors.contenidoInicial && (
            <p className="text-xs text-red-500 mt-1">
              {errors.contenidoInicial}
            </p>
          )}
        </div>

        {/* Nota de cambio */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={14} />
            Nota de cambio
          </label>
          <input
            type="text"
            value={formData.notaCambioInicial || ""}
            onChange={(e) => handleChange("notaCambioInicial", e.target.value)}
            placeholder="Describe brevemente los cambios realizados..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          Cancelar
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Guardando..." : "Guardar borrador"}
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticuloForm;
