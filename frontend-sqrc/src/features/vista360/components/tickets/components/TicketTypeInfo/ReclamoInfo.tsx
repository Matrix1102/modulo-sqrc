import React from "react";
import { formatDate } from "../../helpers";
import type { TicketReclamoDto } from "../../../../../../services/vista360Api";

interface ReclamoInfoProps {
  data: TicketReclamoDto;
}

const ReclamoInfo: React.FC<ReclamoInfoProps> = ({ data }) => {
  return (
    <article className="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-red-900">Información de Reclamo</h3>
      <div className="mt-2 space-y-1 text-sm text-red-800">
        <div>
          <strong>Motivo:</strong> {data.motivoReclamo}
        </div>
        <div>
          <strong>Límite Respuesta:</strong>{" "}
          {formatDate(new Date(data.fechaLimiteRespuesta))}
        </div>
        <div>
          <strong>Límite Resolución:</strong>{" "}
          {formatDate(new Date(data.fechaLimiteResolucion))}
        </div>
        <div>
          <strong>Resultado:</strong> {data.resultado || "Pendiente"}
        </div>
      </div>
    </article>
  );
};

export default ReclamoInfo;
