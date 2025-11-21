import { X, Trash2, Plus } from "lucide-react";
import { QuestionCard } from "./QuestionCard";

export const TemplateEditModal = ({ isOpen, onClose, template }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      {/* Nota: overflow-hidden en el contenedor para que el footer se quede fijo si quieres */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header Fijo */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Modificar Plantilla
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-bold text-gray-900">Nombre:</span>{" "}
                {template?.nombre}
              </p>
              <p>
                <span className="font-bold text-gray-900">Descripción:</span>{" "}
                {template?.descripcion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo Scrolleable */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-1">
          {/* Lista de Preguntas (Modo Edición) */}
          {template?.preguntas.map((preg: any, idx: number) => (
            <QuestionCard
              key={preg.id}
              index={idx + 1}
              questionText={preg.texto}
              // Inyectamos el botón de borrar en el header
              headerAction={
                <button className="text-white/70 hover:text-white transition p-1 hover:bg-white/10 rounded">
                  <Trash2 size={16} />
                </button>
              }
            >
              {/* Contenido: Selects de configuración */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-700">
                    Tipo:
                  </label>
                  <select
                    defaultValue={preg.tipo}
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  >
                    <option value="RADIO">Radio (1 - 5)</option>
                    <option value="BOOLEAN">Booleano (Sí / No)</option>
                    <option value="TEXT">Texto Libre</option>
                  </select>
                </div>
                {/* Aquí podrías añadir más configs como "Obligatoria" */}
              </div>
            </QuestionCard>
          ))}

          {/* Botón Agregar Pregunta */}
          <button className="w-full mt-2 border-2 border-blue-400 border-dashed rounded-xl p-4 flex items-center justify-center text-blue-600 font-bold hover:bg-blue-50 transition-all group">
            <Plus className="mr-2 group-hover:scale-110 transition-transform" />
            Agregar Nueva Pregunta
          </button>
        </div>

        {/* Footer Fijo */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            Cancelar
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition transform active:scale-95">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
