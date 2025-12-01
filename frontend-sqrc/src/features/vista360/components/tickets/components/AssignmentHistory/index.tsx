import React, { useState } from "react";
import type { AssignmentDto } from "../../../../../../services/vista360Api";
import AssignmentCard from "./AssignmentCard";
import EmployeeDetails from "./EmployeeDetails";
import DocumentationDetails from "./DocumentationDetails";

interface AssignmentHistorySectionProps {
  asignaciones: AssignmentDto[];
}

/**
 * Sección que muestra el historial completo de asignaciones del ticket.
 * Cada asignación puede expandirse para ver más detalles.
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

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Historial de Asignaciones ({asignaciones.length})
      </h3>

      {asignaciones.length === 0 ? (
        <p className="text-sm text-gray-500">No hay asignaciones registradas.</p>
      ) : (
        <div className="space-y-3">
          {asignaciones.map((asignacion, index) => (
            <AssignmentCard
              key={asignacion.idAsignacion}
              asignacion={asignacion}
              index={index}
              isExpanded={expandedAssignments.has(asignacion.idAsignacion)}
              onToggle={() => toggleAssignment(asignacion.idAsignacion)}
            />
          ))}
        </div>
      )}
    </article>
  );
};

export default AssignmentHistorySection;
export { AssignmentCard, EmployeeDetails, DocumentationDetails };
