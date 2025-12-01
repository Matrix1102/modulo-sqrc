import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SearchFilterComponent,
  TicketDetailViewer,
  TicketListComponent,
  createDefaultFilters,
} from "./tickets";
import type {
  FilterCriteria,
  TicketDetail as LocalTicketDetail,
  TicketSummary as LocalTicketSummary,
} from "./tickets";
import {
  searchTickets,
  getTicketById,
  getTicketsByClienteId,
  type TicketSummary as ApiTicketSummary,
  type TicketDetail as ApiTicketDetail,
  type TicketFilter as ApiTicketFilter,
} from "../../../services/vista360Api";
import { useCustomer } from "../context/CustomerContext";

// Mapeo de valores API a valores de UI
const statusMap: Record<string, string> = {
  ABIERTO: "Abierto",
  ESCALADO: "Escalado",
  DERIVADO: "Derivado",
  AUDITORIA: "Auditoría",
  CERRADO: "Cerrado",
};

const typeMap: Record<string, string> = {
  CONSULTA: "Consulta",
  QUEJA: "Queja",
  RECLAMO: "Reclamo",
  SOLICITUD: "Solicitud",
};

const channelMap: Record<string, string> = {
  Web: "Web",
  Email: "Email",
  Telefono: "Llamada",
  Chat: "Chat",
  API: "API",
  Interno: "Interno",
  App: "Aplicación Móvil",
  Otro: "Otro",
};

// Función auxiliar para crear fechas válidas
const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Conversión de API DTO a tipo de UI
const mapApiSummaryToLocal = (api: ApiTicketSummary): LocalTicketSummary => ({
  id: api.id,
  reasonTitle: api.reasonTitle,
  status: (statusMap[api.status] || api.status) as LocalTicketSummary['status'],
  relevantDate: parseDate(api.relevantDate) || new Date(),
  priority: api.priority,
});

const mapApiDetailToLocal = (api: ApiTicketDetail): LocalTicketDetail => ({
  id: api.id,
  reasonTitle: api.reasonTitle,
  status: (statusMap[api.status] || api.status) as LocalTicketDetail['status'],
  priority: "Media", // Se calcula en el backend pero no viene en el DTO detail, usamos default
  description: api.description,
  type: (typeMap[api.type] || api.type) as LocalTicketDetail['type'],
  channel: (channelMap[api.channel] || api.channel) as LocalTicketDetail['channel'],
  creationDate: parseDate(api.createdDate) || new Date(),
  attentionDate: api.assignmentHistory.length > 0 ? parseDate(api.assignmentHistory[0].startDate) : null,
  closingDate: parseDate(api.closedDate),
  kbArticleId: api.kbArticleId ? `KB-${api.kbArticleId}` : null,
  lastAgentName: api.lastAgentName,
  assignmentHistory: api.assignmentHistory.map(a => ({
    agentName: a.agentName,
    area: a.area,
    startDate: parseDate(a.startDate) || new Date(),
    endDate: parseDate(a.endDate),
    stepStatus: a.stepStatus === "EN_PROGRESO" ? "En progreso" : "Completado",
    notes: a.notes || "",
  })),
});

// Mapeo de filtros UI a filtros API
const mapLocalFiltersToApi = (criteria: FilterCriteria, clienteId?: number): ApiTicketFilter => {
  const apiFilter: ApiTicketFilter = {};

  if (criteria.term.trim()) {
    apiFilter.term = criteria.term.trim();
  }

  if (criteria.dateRange.start) {
    apiFilter.dateStart = criteria.dateRange.start.toISOString().split('T')[0];
  }

  if (criteria.dateRange.end) {
    apiFilter.dateEnd = criteria.dateRange.end.toISOString().split('T')[0];
  }

  if (criteria.status.length > 0) {
    const reverseStatusMap: Record<string, string> = {
      "Abierto": "ABIERTO",
      "Escalado": "ESCALADO",
      "Derivado": "DERIVADO",
      "Cerrado": "CERRADO",
    };
    apiFilter.status = criteria.status.map(s => reverseStatusMap[s] || s) as any;
  }

  if (criteria.type) {
    const reverseTypeMap: Record<string, string> = {
      "Consulta": "CONSULTA",
      "Queja": "QUEJA",
      "Reclamo": "RECLAMO",
      "Solicitud": "SOLICITUD",
    };
    apiFilter.type = reverseTypeMap[criteria.type] as any;
  }

  if (criteria.channel) {
    const reverseChannelMap: Record<string, string> = {
      "Web": "Web",
      "Email": "Email",
      "Llamada": "Telefono",
      "Chat": "Chat",
      "API": "API",
      "Interno": "Interno",
      "Aplicación Móvil": "App",
      "Otro": "Otro",
    };
    apiFilter.channel = reverseChannelMap[criteria.channel] as any;
  }

  if (clienteId) {
    apiFilter.clienteId = clienteId;
  }

  return apiFilter;
};

// Los datos ahora vienen del backend real

// Servicio real que conecta con el backend
const ticketService = {
  async searchTickets(filters: FilterCriteria, clienteId?: number): Promise<LocalTicketSummary[]> {
    const apiFilter = mapLocalFiltersToApi(filters, clienteId);
    const apiResults = await searchTickets(apiFilter);
    return apiResults.map(mapApiSummaryToLocal);
  },

  async getTicketById(id: number): Promise<LocalTicketDetail> {
    const apiDetail = await getTicketById(id);
    return mapApiDetailToLocal(apiDetail);
  },

  async getTicketsByClienteId(clienteId: number): Promise<LocalTicketSummary[]> {
    const apiResults = await getTicketsByClienteId(clienteId);
    return apiResults.map(mapApiSummaryToLocal);
  },
};

const CustomerTicketsView: React.FC = () => {
  const { cliente } = useCustomer();
  const initialFilters = useMemo(() => createDefaultFilters(), []);
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [searchResults, setSearchResults] = useState<ReadonlyArray<LocalTicketSummary>>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleSearch = useCallback(async (criteria: FilterCriteria) => {
    if (!cliente?.idCliente) {
      setSearchResults([]);
      setSelectedTicketId(null);
      return;
    }

    try {
      // Buscar tickets solo del cliente actual
      const results = await ticketService.searchTickets(criteria, cliente.idCliente);
      setFilters(criteria);
      setSearchResults(results);
      setSelectedTicketId(results[0]?.id ?? null);
    } catch (error: any) {
      console.error('Error al buscar tickets:', error);
      setSearchResults([]);
      setSelectedTicketId(null);
    }
  }, [cliente?.idCliente]);

  const handleSelectTicket = useCallback((ticketId: number) => {
    setSelectedTicketId(ticketId);
  }, []);

  useEffect(() => {
    void handleSearch(initialFilters);
  }, [handleSearch, initialFilters]);

  // Mensaje cuando no hay cliente seleccionado
  if (!cliente) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">No hay cliente seleccionado</p>
          <p className="text-sm text-gray-500">Por favor, busca un cliente en la pestaña "Básico" para ver sus tickets</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Cliente:</span> {cliente.nombre} {cliente.apellido} (DNI: {cliente.dni})
        </p>
      </div>
      <SearchFilterComponent onSearch={handleSearch} initialFilters={filters} />

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(300px,35%)_1fr]">
        <TicketListComponent
          tickets={searchResults}
          onSelect={handleSelectTicket}
          activeId={selectedTicketId}
        />

        <div className="relative">
          <TicketDetailViewer ticketId={selectedTicketId} />
        </div>
      </div>
    </section>
  );
};

export default CustomerTicketsView;
