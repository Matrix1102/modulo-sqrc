import React, { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import type { EmployeeDto } from "../../../../../../../services/vista360Api";

interface EmployeeDetailsProps {
  empleado: EmployeeDto;
}

/**
 * Componente expandible con diseño moderno para mostrar detalles del empleado.
 */
const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ empleado }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden transition-all duration-200 hover:border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
            <User size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {empleado.nombre} {empleado.apellido}
            </p>
            <p className="text-xs text-gray-500">{empleado.cargo}</p>
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
          <div className="px-3 pb-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  Área
                </p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">
                  {empleado.area}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  ID Empleado
                </p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">
                  {empleado.idEmpleado}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
