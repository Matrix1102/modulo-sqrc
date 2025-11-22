import React, { useEffect, useState } from "react";
import {
  STATUS_BADGE_VARIANTS,
  STATUS_TEXT_VARIANTS,
  formatDate,
  formatDateTime,
} from "./helpers";
import type { TicketDetail } from "./types";

export interface TicketDetailViewerProps {
  ticket: TicketDetail | null;
}

const TicketDetailViewer: React.FC<TicketDetailViewerProps> = ({ ticket }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setIsHistoryOpen(false);
  }, [ticket?.id]);

  if (!ticket) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl bg-gray-100 p-6 text-sm text-gray-500">
        Selecciona un ticket para visualizar el detalle completo.
      </section>
    );
  }

  const latestHistory = ticket.assignmentHistory[0] ?? null;
  const timelineItems = isHistoryOpen
    ? ticket.assignmentHistory
    : latestHistory
      ? [latestHistory]
      : [];
  const hasAdditionalHistory = ticket.assignmentHistory.length > 1;

  const infoItems: Array<{ label: string; value: string }> = [
    { label: "Tipo", value: ticket.type },
    { label: "Canal", value: ticket.channel },
    { label: "Prioridad", value: ticket.priority },
    { label: "Creación", value: formatDate(ticket.creationDate) },
    { label: "Atención", value: formatDate(ticket.attentionDate) },
    { label: "Cierre", value: formatDate(ticket.closingDate) },
    { label: "Artículo KB", value: ticket.kbArticleId ?? "Sin artículo vinculado" },
    { label: "Último agente", value: ticket.lastAgentName },
  ];

  return (
    <section className="flex h-full flex-col gap-5 rounded-xl bg-gray-100 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{ticket.reasonTitle}</h2>
          <p className="text-sm text-gray-500">Última atención por {ticket.lastAgentName}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_VARIANTS[ticket.status]}`}
        >
          {ticket.status}
        </span>
      </header>

      <article className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Descripción</h3>
        <p className="mt-2 text-sm text-gray-700">{ticket.description}</p>
      </article>

      <article className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Información general</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {infoItems.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium text-gray-800">{item.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Historial de asignaciones</h3>
          {hasAdditionalHistory && (
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-700"
            >
              {isHistoryOpen
                ? "Mostrar último movimiento"
                : `Ver historial completo (${ticket.assignmentHistory.length})`}
            </button>
          )}
        </div>

        {timelineItems.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No hay movimientos registrados para este ticket.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {timelineItems.map((entry, index) => {
              const isLast = index === timelineItems.length - 1;
              return (
                <div
                  key={`${entry.agentName}-${entry.startDate.toISOString()}-${index}`}
                  className="relative pl-6"
                >
                  {!isLast && <span className="absolute left-1 top-4 h-full w-px bg-gray-200" aria-hidden />}
                  <span className="absolute left-0 top-3 inline-flex h-3 w-3 rounded-full bg-blue-500" aria-hidden />

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{entry.agentName}</p>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${STATUS_TEXT_VARIANTS[ticket.status]}`}
                      >
                        {entry.stepStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Área: {entry.area}</p>
                    <div className="mt-2 grid gap-1 text-xs text-gray-600 sm:grid-cols-2">
                      <span>Inicio: {formatDateTime(entry.startDate)}</span>
                      <span>Fin: {formatDateTime(entry.endDate)}</span>
                    </div>
                    {entry.notes && <p className="mt-2 text-sm text-gray-700">{entry.notes}</p>}
                  </div>
                </div>
              );
            })}

            {!isHistoryOpen && hasAdditionalHistory && (
              <p className="text-xs text-gray-500">
                Se muestran los movimientos más recientes. Expande para revisar el historial completo.
              </p>
            )}
          </div>
        )}
      </article>
    </section>
  );
};

export default TicketDetailViewer;
