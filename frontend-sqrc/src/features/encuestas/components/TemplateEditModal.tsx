import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, Save } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import showToast from "../../../services/notification";

interface TemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any; // Puede ser null (Crear) o un objeto (Editar)
  onSaved?: (createdOrUpdated?: any) => void;
}

export const TemplateEditModal: React.FC<TemplateEditModalProps> = ({
  isOpen,
  onClose,
  template,
  onSaved,
}) => {
  // --- ESTADOS DEL FORMULARIO ---
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [alcance, setAlcance] = useState<string>("AGENTE");

  // --- EFECTO DE CARGA / RESETEO ---
  // Cada vez que se abre el modal, decidimos si cargar datos o limpiar
  useEffect(() => {
    if (isOpen) {
      if (template) {
        // MODO EDICIÓN: Cargar lo que viene de la BD
        setNombre(template.nombre || "");
        setDescripcion(template.descripcion || "");
        setPreguntas(template.preguntas || []);
        setAlcance(template.alcanceEvaluacion || template.alcance || "AGENTE");
      } else {
        // MODO CREACIÓN: Limpiar todo para empezar de cero
        setNombre("");
        setDescripcion("");
        setPreguntas([
          // Agregamos una pregunta vacía por defecto para ayudar al usuario
          { id: Date.now(), texto: "", tipo: "TEXT", obligatoria: false },
        ]);
      }
    }
  }, [isOpen, template]);

  // Si está cerrado, no renderizamos nada
  if (!isOpen) return null;

  // Determinamos el título según si hay template o no
  const isCreating = !template || !template.id;

  // --- MANEJADORES DE PREGUNTAS ---

  const handleAddQuestion = () => {
    setPreguntas([
      ...preguntas,
      { id: Date.now(), texto: "", tipo: "TEXT", obligatoria: false },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setPreguntas(preguntas.filter((_, i) => i !== idx));
  };

  const handleChangeQuestion = (idx: number, field: string, value: any) => {
    const newQuestions = [...preguntas];
    newQuestions[idx] = { ...newQuestions[idx], [field]: value };
    setPreguntas(newQuestions);
  };

  const handleSave = () => {
    (async () => {
      setSaving(true);
      try {
        const payload = { nombre, descripcion, preguntas, alcanceEvaluacion: alcance };
        if (isCreating) {
          const created = await (await import("../services/encuestaService")).encuestaService.plantillaCreate(payload);
          showToast('Plantilla creada', 'success');
          onClose();
          onSaved && onSaved(created);
        } else {
          const id = template?.id || template?.templateId || template?.templateId;
          if (!id) throw new Error("ID de plantilla no encontrado");
          const updated = await (await import("../services/encuestaService")).encuestaService.plantillaUpdate(Number(id), payload);
          showToast('Plantilla actualizada', 'success');
          onClose();
          onSaved && onSaved(updated);
        }
      } catch (err) {
        console.error("Error guardando plantilla", err);
        showToast('Error al guardar la plantilla: ' + ((err as any)?.message || ''), 'error');
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    /* 1. OVERLAY OSCURO */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* 2. CONTENEDOR BLANCO */}
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {isCreating ? "Nueva Plantilla" : "Modificar Plantilla"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- CUERPO SCROLLEABLE --- */}
        <div className="overflow-y-auto p-8 bg-gray-50 flex-1 space-y-8">
          {/* SECCIÓN 1: METADATOS (Nombre y Descripción) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nombre de la Plantilla
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Encuesta de Satisfacción Mensual"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Alcance</label>
              <select value={alcance} onChange={(e) => setAlcance(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                <option value="AGENTE">Agente</option>
                <option value="SERVICIO">Servicio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripción del objetivo de esta encuesta..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none text-sm"
              />
            </div>
          </div>

          {/* SECCIÓN 2: LISTA DE PREGUNTAS */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Preguntas ({preguntas.length})
              </h3>
            </div>

            <div className="space-y-6">
              {preguntas.map((preg, idx) => (
                <QuestionCard
                  key={preg.id || idx}
                  index={idx + 1}
                  questionText={
                    // Input transparente para editar el título de la pregunta
                    <input
                      type="text"
                      value={preg.texto}
                      onChange={(e) =>
                        handleChangeQuestion(idx, "texto", e.target.value)
                      }
                      placeholder="Escribe la pregunta aquí..."
                      className="bg-transparent text-white placeholder-blue-200 border-b border-blue-400 focus:border-white outline-none w-full font-semibold"
                    />
                  }
                  // Botón de eliminar en la cabecera
                  headerAction={
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-white/70 hover:text-white transition p-1.5 hover:bg-white/10 rounded-lg"
                      title="Eliminar pregunta"
                    >
                      <Trash2 size={18} />
                    </button>
                  }
                >
                  {/* Controles de Configuración (Tipo, Obligatoria) */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-bold text-gray-700">
                        Tipo:
                      </label>
                      <select
                        value={preg.tipo}
                        onChange={(e) =>
                          handleChangeQuestion(idx, "tipo", e.target.value)
                        }
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm min-w-[160px]"
                      >
                        <option value="RADIO">Radio (1 - 5)</option>
                        <option value="BOOLEAN">Booleano (Sí / No)</option>
                        <option value="TEXT">Texto Libre</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preg.obligatoria}
                        onChange={(e) =>
                          handleChangeQuestion(
                            idx,
                            "obligatoria",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <label className="text-sm font-medium text-gray-600">
                        Obligatoria
                      </label>
                    </div>
                  </div>
                </QuestionCard>
              ))}
            </div>

            {/* Botón Agregar Pregunta */}
            <button
              onClick={handleAddQuestion}
              className="w-full mt-6 border-2 border-blue-300 border-dashed rounded-xl p-4 flex items-center justify-center text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <Plus
                className="mr-2 group-hover:scale-110 transition-transform"
                strokeWidth={3}
              />
              Agregar Nueva Pregunta
            </button>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 disabled:opacity-60 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <Save size={18} />
            {isCreating ? "Crear Plantilla" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};
