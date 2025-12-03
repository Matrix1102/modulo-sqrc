import React from "react";
import { ChevronDown, Circle, CheckCircle2, ArrowRight } from "lucide-react";
import { formatDateTime } from "../../helpers";
import type { AssignmentDto } from "../../../../../../services/vista360Api";
import EmployeeDetails from "./EmployeeDetails";
import DocumentationDetails from "./DocumentationDetails";

interface AssignmentCardProps {
  asignacion: AssignmentDto;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

/**
 * Tarjeta individual de asignación con diseño moderno tipo timeline.
 * Transiciones suaves y estilo minimalista.
 */
const AssignmentCard: React.FC<AssignmentCardProps> = ({
  asignacion,
  index,
  isExpanded,
  onToggle,
}) => {
  const isActive = asignacion.fechaFin === null;

  return (
    <div className="relative flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
            isActive
              ? "border-emerald-400 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100"
              : "border-gray-200 bg-white text-gray-400"
          }`}
        >
          {isActive ? (
            <Circle size={16} className="fill-current" />
          ) : (
            <CheckCircle2 size={18} />
          )}
        </div>
      </div>

      {/* Card content */}
      <div
        className={`flex-1 mb-2 rounded-xl border transition-all duration-300 overflow-hidden ${
          isActive
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm"
            : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm"
        } ${isExpanded ? "ring-1 ring-indigo-100" : ""}`}
      >
        {/* Header clickable */}
        <button
          onClick={onToggle}
          className="w-full p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                  {asignacion.tipo}
                </span>
                {isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    En curso
                  </span>
                )}
              </div>

              {/* Agent & Area */}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {asignacion.empleado
                    ? `${asignacion.empleado.nombre} ${asignacion.empleado.apellido}`
                    : "Sin asignar"}
                </span>
                <ArrowRight size={12} className="text-gray-300" />
                <span>{asignacion.area}</span>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                <span>{formatDateTime(new Date(asignacion.fechaInicio))}</span>
                <span>→</span>
                <span className={isActive ? "text-emerald-600 font-medium" : ""}>
                  {asignacion.fechaFin
                    ? formatDateTime(new Date(asignacion.fechaFin))
                    : "Presente"}
                </span>
              </div>
            </div>

            {/* Expand icon */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                isExpanded
                  ? "bg-indigo-100 text-indigo-600 rotate-180"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <ChevronDown size={16} />
            </div>
          </div>
        </button>

        {/* Expanded content */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-100">
              {/* Motivo */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Motivo de Desplazamiento
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {asignacion.motivoDesplazamiento}
                </p>
              </div>

              {/* Employee & Documentation */}
              <div className="space-y-3">
                {asignacion.empleado && <EmployeeDetails empleado={asignacion.empleado} />}

                {asignacion.documentacion && (
                  <DocumentationDetails documentacion={asignacion.documentacion} />
                )}

                {!asignacion.documentacion && !asignacion.empleado && (
                  <p className="text-xs text-gray-400 italic text-center py-2">
                    Sin información adicional disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
