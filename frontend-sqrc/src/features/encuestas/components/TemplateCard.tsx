import React from "react";

interface TemplateCardProps {
  title: string;
  onCrear?: () => void;
  onModificar?: () => void;
  onEliminar?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  onCrear,
  onModificar,
  onEliminar,
}) => {
  return (
    <div className="bg-blue-500 rounded-lg p-4 flex items-center justify-between">
      <span className="text-white font-semibold text-base">{title}</span>
      <div className="flex gap-2">
        <button
          onClick={onCrear}
          className="bg-white text-blue-600 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Crear
        </button>
        <button
          onClick={onModificar}
          className="bg-white text-blue-600 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Modificar
        </button>
        <button
          onClick={onEliminar}
          className="bg-white text-blue-600 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};
