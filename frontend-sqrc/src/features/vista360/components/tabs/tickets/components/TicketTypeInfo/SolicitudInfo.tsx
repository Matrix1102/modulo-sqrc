import React from "react";
import type { TicketSolicitudDto } from "../../../../../../../services/vista360Api";

interface SolicitudInfoProps {
  data: TicketSolicitudDto;
}

const SolicitudInfo: React.FC<SolicitudInfoProps> = ({ data }) => {
  return (
    <article className="rounded-xl bg-green-50 border border-green-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-green-900">Información de Solicitud</h3>
      <div className="mt-2 text-sm text-green-800">
        <strong>Tipo de Solicitud:</strong> {data.tipoSolicitud}
      </div>
    </article>
  );
};

export default SolicitudInfo;
