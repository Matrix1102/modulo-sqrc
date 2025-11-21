import React from "react";

interface QuestionCardProps {
  index: number;
  // CAMBIO AQUÍ: De 'string' a 'React.ReactNode' para aceptar inputs
  questionText: React.ReactNode;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  questionText,
  children,
  headerAction,
}) => {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-4 bg-white">
      {/* Cabecera Azul */}
      <div className="bg-blue-600 px-5 py-3 flex justify-between items-center text-white">
        <h4 className="font-semibold text-sm flex gap-2 items-center flex-1 mr-4">
          <span className="opacity-80 font-mono">{index}.</span>

          {/* Renderizamos el nodo (puede ser texto o el input) */}
          <span className="leading-tight w-full">{questionText}</span>
        </h4>

        {headerAction && <div className="shrink-0 ml-2">{headerAction}</div>}
      </div>

      {/* Cuerpo Gris */}
      <div className="bg-gray-100 p-5 border-t border-gray-200">{children}</div>
    </div>
  );
};
