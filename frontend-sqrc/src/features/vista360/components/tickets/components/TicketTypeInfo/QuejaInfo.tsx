import React from "react";
import type { TicketQuejaDto } from "../../../../../../services/vista360Api";

interface QuejaInfoProps {
  data: TicketQuejaDto;
}

const QuejaInfo: React.FC<QuejaInfoProps> = ({ data }) => {
  return (
    <article className="rounded-xl bg-amber-50 border border-amber-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-amber-900">Información de Queja</h3>
      <div className="mt-2 space-y-1 text-sm text-amber-800">
        <div>
          <strong>Impacto:</strong> {data.impacto}
        </div>
        <div>
          <strong>Área Involucrada:</strong> {data.areaInvolucrada}
        </div>
      </div>
    </article>
  );
};

export default QuejaInfo;
