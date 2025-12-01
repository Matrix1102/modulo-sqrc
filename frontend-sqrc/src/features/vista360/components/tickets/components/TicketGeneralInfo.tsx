import React from "react";
import { formatDate } from "../helpers";

interface TicketGeneralInfoProps {
  tipoTicket: string;
  origen: string;
  priority: string;
  fechaCreacion: string;
  fechaCierre: string | null;
  clienteId: number | null;
}

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </dt>
    <dd className="mt-1 text-sm font-medium text-gray-800">{value}</dd>
  </div>
);

const TicketGeneralInfo: React.FC<TicketGeneralInfoProps> = ({
  tipoTicket,
  origen,
  priority,
  fechaCreacion,
  fechaCierre,
  clienteId,
}) => {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Información general</h3>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoItem label="Tipo" value={tipoTicket} />
        <InfoItem label="Canal" value={origen} />
        <InfoItem label="Prioridad" value={priority} />
        <InfoItem label="Creación" value={formatDate(new Date(fechaCreacion))} />
        <InfoItem
          label="Cierre"
          value={fechaCierre ? formatDate(new Date(fechaCierre)) : "Aún abierto"}
        />
        <InfoItem label="Cliente ID" value={clienteId?.toString() || "N/A"} />
      </dl>
    </article>
  );
};

export default TicketGeneralInfo;
