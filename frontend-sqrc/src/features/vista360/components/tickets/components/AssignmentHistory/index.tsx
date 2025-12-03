import React, { useState } from "react";
import { Clock, Users } from "lucide-react";
import type { AssignmentDto } from "../../../../../../services/vista360Api";
import AssignmentCard from "./AssignmentCard";
import EmployeeDetails from "./EmployeeDetails";
import DocumentationDetails from "./DocumentationDetails";

interface AssignmentHistorySectionProps {
  asignaciones: AssignmentDto[];
}

/**
 * Sección que muestra el historial completo de asignaciones del ticket.
 * Diseño moderno tipo timeline con transiciones suaves.
 */
const AssignmentHistorySection: React.FC<AssignmentHistorySectionProps> = ({
  asignaciones,
}) => {
  const [expandedAssignments, setExpandedAssignments] = useState<Set<number>>(
    new Set()
  );

  const toggleAssignment = (id: number) => {
    setExpandedAssignments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeCount = asignaciones.filter((a) => a.fechaFin === null).length;

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      {/* Header minimalista */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Historial de Asignaciones
            </h3>
            <p className="text-xs text-gray-500">
              {asignaciones.length} {asignaciones.length === 1 ? "registro" : "registros"}
              {activeCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeCount} activa{activeCount > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {asignaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Clock size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Sin asignaciones</p>
          <p className="text-xs text-gray-400 mt-1">
            Este ticket aún no tiene historial de asignaciones
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Línea vertical del timeline */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-200 via-gray-200 to-transparent" />

          <div className="space-y-4">
            {asignaciones.map((asignacion, index) => (
              <AssignmentCard
                key={asignacion.idAsignacion}
                asignacion={asignacion}
                index={index}
                isExpanded={expandedAssignments.has(asignacion.idAsignacion)}
                onToggle={() => toggleAssignment(asignacion.idAsignacion)}
                isLast={index === asignaciones.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default AssignmentHistorySection;
export { AssignmentCard, EmployeeDetails, DocumentationDetails };
