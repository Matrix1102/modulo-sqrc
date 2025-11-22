import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SearchFilterComponent,
  TicketDetailViewer,
  TicketListComponent,
  createDefaultFilters,
} from "./tickets";
import type {
  FilterCriteria,
  TicketDetail,
  TicketService,
  TicketSummary,
} from "./tickets";

const MOCK_TICKET_DETAILS: TicketDetail[] = [
  {
    id: 101,
    reasonTitle: "Falla Telefónica",
    status: "Cerrado",
    priority: "Alta",
    description: "Corte del servicio telefónico por mantenimiento en la zona norte.",
    type: "Queja",
    channel: "Llamada",
    creationDate: new Date("2024-12-10T08:20:00-05:00"),
    attentionDate: new Date("2024-12-10T12:15:00-05:00"),
    closingDate: new Date("2024-12-10T18:45:00-05:00"),
    kbArticleId: "KB-204",
    lastAgentName: "Carla Ríos",
    assignmentHistory: [
      {
        agentName: "Carla Ríos",
        area: "Soporte Técnico",
        startDate: new Date("2024-12-10T12:15:00-05:00"),
        endDate: new Date("2024-12-10T18:45:00-05:00"),
        stepStatus: "Caso resuelto",
        notes: "Se reinició el servicio y se validó con el cliente la recuperación de la línea.",
      },
      {
        agentName: "Javier Torres",
        area: "Mesa de Ayuda",
        startDate: new Date("2024-12-10T08:20:00-05:00"),
        endDate: new Date("2024-12-10T11:45:00-05:00"),
        stepStatus: "Investigación",
        notes: "Se identificó un corte programado por mantenimiento preventivo.",
      },
    ],
  },
  {
    id: 102,
    reasonTitle: "Falla Factura",
    status: "Abierto",
    priority: "Media",
    description: "El cliente reporta cargos duplicados en la factura de noviembre.",
    type: "Reclamo",
    channel: "Presencial",
    creationDate: new Date("2024-11-28T10:05:00-05:00"),
    attentionDate: null,
    closingDate: null,
    kbArticleId: null,
    lastAgentName: "Marcos Díaz",
    assignmentHistory: [
      {
        agentName: "Marcos Díaz",
        area: "Backoffice Facturación",
        startDate: new Date("2024-11-28T14:40:00-05:00"),
        endDate: null,
        stepStatus: "En revisión",
        notes: "Se solicitó cuadro de facturación a contabilidad para validar cargos.",
      },
      {
        agentName: "Lucía Fernández",
        area: "Atención Comercial",
        startDate: new Date("2024-11-28T10:05:00-05:00"),
        endDate: new Date("2024-11-28T13:50:00-05:00"),
        stepStatus: "Derivación",
        notes: "Se recopiló documentación y se escaló a backoffice para revisión detallada.",
      },
    ],
  },
  {
    id: 103,
    reasonTitle: "Solicitud de Equipos Adicionales",
    status: "Derivado",
    priority: "Baja",
    description: "El cliente solicita agregar dos terminales telefónicos para nuevas extensiones.",
    type: "Solicitud",
    channel: "Llamada",
    creationDate: new Date("2024-12-02T09:30:00-05:00"),
    attentionDate: new Date("2024-12-03T11:00:00-05:00"),
    closingDate: null,
    kbArticleId: "KB-108",
    lastAgentName: "Paola Castro",
    assignmentHistory: [
      {
        agentName: "Paola Castro",
        area: "Implementaciones",
        startDate: new Date("2024-12-03T11:00:00-05:00"),
        endDate: null,
        stepStatus: "Coordinando instalación",
        notes: "Se coordina disponibilidad con logística para enviar equipos.",
      },
      {
        agentName: "Luis Gómez",
        area: "Atención Comercial",
        startDate: new Date("2024-12-02T09:30:00-05:00"),
        endDate: new Date("2024-12-03T09:15:00-05:00"),
        stepStatus: "Validación",
        notes: "Se validó la disponibilidad de stock y se derivó a implementaciones.",
      },
    ],
  },
];

const DETAIL_MAP: Map<number, TicketDetail> = new Map(
  MOCK_TICKET_DETAILS.map((detail) => [detail.id, detail]),
);

const MOCK_SUMMARIES: TicketSummary[] = MOCK_TICKET_DETAILS.map((detail) => ({
  id: detail.id,
  reasonTitle: detail.reasonTitle,
  status: detail.status,
  relevantDate: detail.closingDate ?? detail.attentionDate ?? detail.creationDate,
  priority: detail.priority,
}));

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const cloneTicketDetail = (detail: TicketDetail): TicketDetail => ({
  ...detail,
  assignmentHistory: detail.assignmentHistory.map((entry) => ({ ...entry })),
});

const mockTicketService: TicketService = {
  async searchTickets(filters: FilterCriteria) {
    await delay(200);
    return MOCK_SUMMARIES.filter((summary) => {
      const detail = DETAIL_MAP.get(summary.id);
      if (!detail) {
        return false;
      }

      const term = filters.term.trim().toLowerCase();
      const matchesTerm = term
        ? [
            summary.reasonTitle,
            summary.priority,
            detail.description,
            detail.lastAgentName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(term)
        : true;

      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(summary.status);

      const matchesType = !filters.type || detail.type === filters.type;
      const matchesChannel =
        !filters.channel || detail.channel === filters.channel;

      const { start, end } = filters.dateRange;
      const matchesDate =
        (!start || summary.relevantDate >= start) &&
        (!end || summary.relevantDate <= end);

      return (
        matchesTerm &&
        matchesStatus &&
        matchesType &&
        matchesChannel &&
        matchesDate
      );
    });
  },

  async getTicketById(id: number) {
    await delay(180);
    const detail = DETAIL_MAP.get(id);
    if (!detail) {
      throw new Error(`Ticket ${id} no encontrado`);
    }

    return cloneTicketDetail(detail);
  },
};

const CustomerTicketsView: React.FC = () => {
  const initialFilters = useMemo(() => createDefaultFilters(), []);
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [searchResults, setSearchResults] = useState<ReadonlyArray<TicketSummary>>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTicket, setActiveTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (criteria: FilterCriteria) => {
    setIsLoading(true);
    try {
      const results = await mockTicketService.searchTickets(criteria);
      setFilters(criteria);
      setSearchResults(results);
      setSelectedTicketId(results[0]?.id ?? null);
      setActiveTicket(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectTicket = useCallback((ticketId: number) => {
    setSelectedTicketId(ticketId);
  }, []);

  const loadTicketDetail = useCallback(async (ticketId: number) => {
    setIsLoading(true);
    try {
      const detail = await mockTicketService.getTicketById(ticketId);
      setActiveTicket(detail);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicketId === null) {
      setActiveTicket(null);
      return;
    }

    void loadTicketDetail(selectedTicketId);
  }, [selectedTicketId, loadTicketDetail]);

  useEffect(() => {
    void handleSearch(initialFilters);
  }, [handleSearch, initialFilters]);

  return (
    <section className="flex h-full flex-col gap-6">
      <SearchFilterComponent onSearch={handleSearch} initialFilters={filters} />

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(300px,35%)_1fr]">
        <TicketListComponent
          tickets={searchResults}
          onSelect={handleSelectTicket}
          activeId={selectedTicketId}
        />

        <div className="relative">
          <TicketDetailViewer ticket={activeTicket} />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
              <span className="animate-pulse text-sm font-medium text-gray-600">
                Cargando información...
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerTicketsView;
