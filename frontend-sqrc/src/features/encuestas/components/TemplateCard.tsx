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
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
  loading?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  type,
  description = "Plantilla activa actualmente",
  onAction,
  canEdit = true,
  canDelete = true,
  canCreate = true,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full"></div>

        <div className="relative z-10 mb-6">
          <div className="h-6 bg-white/30 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded w-5/6 animate-pulse"></div>
        </div>

        <div className="relative z-10 flex gap-2">
          <div className="flex-1 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="flex-1 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

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
          className={`flex-1 ${canCreate ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 cursor-not-allowed opacity-60'} text-white py-2 px-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 backdrop-blur-sm`}
          title={canCreate ? 'Crear nueva versión (Reemplaza la actual)' : 'Crear disponible'}
          disabled={!canCreate || loading}
        >
          <Plus size={16} /> <span className="hidden xl:inline">Nueva</span>
        </button>

        {/* Botón Modificar (Versión actual) */}
        <button
          onClick={() => onAction("EDIT", type)}
          className={`flex-1 ${canEdit ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/10 cursor-not-allowed opacity-60'} py-2 px-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm`}
          title={canEdit ? 'Editar plantilla vigente' : 'No hay plantilla vigente para editar'}
          disabled={!canEdit || loading}
        >
          <Edit size={16} /> Modificar
        </button>

        {/* Botón Eliminar */}
        <button
          onClick={() => onAction("DELETE", type)}
          className={`p-2 rounded-lg transition backdrop-blur-sm ${canDelete ? 'bg-red-500/20 hover:bg-red-500 text-white' : 'bg-red-200/40 cursor-not-allowed opacity-60 text-white'}`}
          title={canDelete ? 'Desactivar plantilla' : 'No hay plantilla vigente para desactivar'}
          disabled={!canDelete || loading}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
