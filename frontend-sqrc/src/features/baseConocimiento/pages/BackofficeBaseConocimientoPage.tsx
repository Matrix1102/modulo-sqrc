import React from "react";
import { Globe } from "lucide-react";
import TodosArticulosView from "../components/TodosArticulosView";

/**
 * Página de Base de Conocimiento para Backoffice.
 * Solo muestra la vista de "Todos los artículos" ya que el backoffice
 * no puede crear artículos, solo consultarlos.
 */
const BackofficeBaseConocimientoPage: React.FC = () => {
  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          BASE DE CONOCIMIENTO
        </h1>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Tab único (solo visual, sin navegación) */}
        <nav className="bg-white">
          <ul className="flex border-b border-gray-200">
            <li className="min-w-40 flex-1 sm:min-w-0">
              <div
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-center text-sm font-medium border-b-2 border-blue-500 bg-blue-50 text-blue-600"
                aria-selected={true}
              >
                <Globe size={18} />
                <span>Todos los artículos</span>
              </div>
            </li>
          </ul>
        </nav>

        {/* Content */}
        <div className="border-t border-gray-100 p-6">
          <TodosArticulosView />
        </div>
      </div>
    </section>
  );
};

export default BackofficeBaseConocimientoPage;
