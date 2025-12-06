import React from "react";
import { Ticket } from "lucide-react";
import { formatShortDate, STATUS_BADGE_VARIANTS } from "./helpers";
import type { TicketSummary } from "./types";

export interface TicketListComponentProps {
  tickets: ReadonlyArray<TicketSummary>;
  onSelect: (id: number) => void;
  activeId: number | null;
}

const TicketListComponent: React.FC<TicketListComponentProps> = ({
  tickets,
  onSelect,
  activeId,
}) => {
  return (
    <aside className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Resultados</h3>
        <p className="text-xs text-gray-500">{tickets.length} tickets encontrados</p>
      </header>

      <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
        {tickets.length === 0 && (
          <li className="flex flex-col items-center justify-center gap-3 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Ticket size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Sin resultados. Ajusta los filtros.</p>
          </li>
        )}

        {tickets.map((ticket) => {
          const isActive = ticket.id === activeId;
          return (
            <li key={ticket.id}>
              <button
                type="button"
                onClick={() => onSelect(ticket.id)}
                className={`flex w-full flex-col gap-2 p-4 text-left transition-colors ${
                  isActive ? "border-l-4 border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">{ticket.reasonTitle}</h4>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_VARIANTS[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium text-gray-600">Prioridad: {ticket.priority}</span>
                  <span className="text-gray-400">•</span>
                  <span>{formatShortDate(ticket.relevantDate)}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default TicketListComponent;
