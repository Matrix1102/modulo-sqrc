import React, { useState } from "react";
import { FileText, ChevronDown, BookOpen, Calendar, UserCircle } from "lucide-react";
import { formatDateTime } from "../../helpers";
import type { DocumentacionDto } from "../../../../../../../services/vista360Api";

interface DocumentationDetailsProps {
  documentacion: DocumentacionDto;
}

/**
 * Componente expandible con diseño moderno para mostrar documentación.
 */
const DocumentationDetails: React.FC<DocumentationDetailsProps> = ({ documentacion }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden transition-all duration-200 hover:border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600">
            <FileText size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Documentación</p>
            <p className="text-xs text-gray-500">
              {formatDateTime(new Date(documentacion.fechaCreacion))}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-3">
            {/* Problema */}
            <div className="rounded-lg bg-red-50/50 border border-red-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-1">
                Problema
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {documentacion.problema}
              </p>
            </div>

            {/* Solución */}
            <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-1">
                Solución
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {documentacion.articulo}
              </p>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-2">
              {documentacion.autor && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-600">
                  <UserCircle size={12} className="text-gray-400" />
                  {documentacion.autor.nombre} {documentacion.autor.apellido}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-600">
                <Calendar size={12} className="text-gray-400" />
                {formatDateTime(new Date(documentacion.fechaCreacion))}
              </div>
            </div>

            {/* KB Article */}
            {documentacion.articuloKB && (
              <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-indigo-500" />
                  <p className="text-xs font-semibold text-indigo-700">
                    Artículo de Base de Conocimiento
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {documentacion.articuloKB.titulo}
                  </p>
                  <span className="text-[10px] font-mono bg-white/60 px-1.5 py-0.5 rounded text-indigo-600">
                    KB-{documentacion.articuloKB.idArticuloKB}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationDetails;
