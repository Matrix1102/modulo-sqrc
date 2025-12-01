import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDateTime } from "../../helpers";
import type { AssignmentDto } from "../../../../../../services/vista360Api";
import EmployeeDetails from "./EmployeeDetails";
import DocumentationDetails from "./DocumentationDetails";

interface AssignmentCardProps {
  asignacion: AssignmentDto;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Tarjeta individual de asignación con capacidad de expansión.
 * Muestra información resumida y detallada al expandir.
 */
const AssignmentCard: React.FC<AssignmentCardProps> = ({
  asignacion,
  index,
  isExpanded,
  onToggle,
}) => {
  const isActive = asignacion.fechaFin === null;

  return (
    <div
      className={`rounded-lg border ${
        isActive ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"
      } p-3`}
    >
      {/* Header de Asignación */}
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              #{index + 1} - {asignacion.tipo}
            </span>
            {isActive && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                En Curso
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {asignacion.empleado
              ? `${asignacion.empleado.nombre} ${asignacion.empleado.apellido}`
              : "Sin asignar"}{" "}
            | {asignacion.area}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDateTime(new Date(asignacion.fechaInicio))} -{" "}
            {asignacion.fechaFin
              ? formatDateTime(new Date(asignacion.fechaFin))
              : "Actual"}
          </p>
        </div>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Contenido Expandido */}
      {isExpanded && (
        <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
          <div className="text-sm">
            <strong className="text-gray-700">Motivo de Desplazamiento:</strong>
            <p className="text-gray-600 mt-1">{asignacion.motivoDesplazamiento}</p>
          </div>

          {asignacion.empleado && <EmployeeDetails empleado={asignacion.empleado} />}
          
          {asignacion.documentacion && (
            <DocumentationDetails documentacion={asignacion.documentacion} />
          )}

          {!asignacion.documentacion && !asignacion.empleado && (
            <p className="text-xs text-gray-500 italic">
              Sin información adicional disponible
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
