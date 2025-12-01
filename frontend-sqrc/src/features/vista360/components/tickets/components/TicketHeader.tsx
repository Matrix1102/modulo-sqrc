import React from "react";
import { STATUS_BADGE_VARIANTS } from "../helpers";

interface TicketHeaderProps {
  titulo: string;
  motivo: string;
  estadoEsp: string;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({
  titulo,
  motivo,
  estadoEsp,
}) => {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{titulo}</h2>
        <p className="text-sm text-gray-500">Motivo: {motivo}</p>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          STATUS_BADGE_VARIANTS[estadoEsp as keyof typeof STATUS_BADGE_VARIANTS] || "bg-gray-100 text-gray-700"
        }`}
      >
        {estadoEsp}
      </span>
    </header>
  );
};

export default TicketHeader;
