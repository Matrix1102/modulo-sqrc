import React from "react";
import { User } from "lucide-react";
import type { EmployeeDto } from "../../../../../../services/vista360Api";

interface EmployeeDetailsProps {
  empleado: EmployeeDto;
}

/**
 * Componente expandible que muestra los detalles del empleado asignado.
 */
const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ empleado }) => {
  return (
    <details className="rounded-lg border border-gray-200 bg-white p-3">
      <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-900">
        <User size={16} />
        Información del Empleado
      </summary>
      <div className="mt-2 space-y-1 text-xs text-gray-700">
        <div>
          <strong>Nombre:</strong> {empleado.nombre} {empleado.apellido}
        </div>
        <div>
          <strong>Cargo:</strong> {empleado.cargo}
        </div>
        <div>
          <strong>Área:</strong> {empleado.area}
        </div>
        <div>
          <strong>ID:</strong> {empleado.idEmpleado}
        </div>
      </div>
    </details>
  );
};

export default EmployeeDetails;
