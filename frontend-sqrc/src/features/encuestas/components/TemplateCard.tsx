import React from "react";
import { Edit, Plus, Trash2 } from "lucide-react";

interface TemplateCardProps {
  title: string;
  type: "AGENTE" | "SERVICIO";
  description?: string;
  onAction: (
    action: "CREATE" | "EDIT" | "DELETE",
    type: "AGENTE" | "SERVICIO"
  ) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  type,
  description = "Plantilla activa actualmente",
  onAction,
}) => {
  return (
    <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Decoración de fondo */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-150"></div>

      <div className="relative z-10 mb-6">
        <h4 className="font-bold text-xl mb-1">{title}</h4>
        <p className="text-blue-100 text-sm">{description}</p>
      </div>

      <div className="relative z-10 flex gap-2">
        {/* Botón Crear (Nueva versión) */}
        <button
          onClick={() => onAction("CREATE", type)}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 backdrop-blur-sm"
          title="Crear nueva versión (Reemplaza la actual)"
        >
          <Plus size={16} /> <span className="hidden xl:inline">Nueva</span>
        </button>

        {/* Botón Modificar (Versión actual) */}
        <button
          onClick={() => onAction("EDIT", type)}
          className="flex-1 bg-white text-blue-600 py-2 px-3 rounded-lg text-sm font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 shadow-sm"
          title="Editar plantilla vigente"
        >
          <Edit size={16} /> Modificar
        </button>

        {/* Botón Eliminar */}
        <button
          onClick={() => onAction("DELETE", type)}
          className="bg-red-500/20 hover:bg-red-500 text-white p-2 rounded-lg transition backdrop-blur-sm"
          title="Desactivar plantilla"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
