import React from "react";
import type { TicketConsultaDto } from "../../../../../../services/vista360Api";

interface ConsultaInfoProps {
  data: TicketConsultaDto;
}

const ConsultaInfo: React.FC<ConsultaInfoProps> = ({ data }) => {
  return (
    <article className="rounded-xl bg-blue-50 border border-blue-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-blue-900">Información de Consulta</h3>
      <div className="mt-2 text-sm text-blue-800">
        <strong>Tema:</strong> {data.tema}
      </div>
    </article>
  );
};

export default ConsultaInfo;
