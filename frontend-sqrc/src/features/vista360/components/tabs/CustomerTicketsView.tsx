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
} from "../../../../services/vista360Api";
import { useCustomer } from "../../context/CustomerContext";

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
  priority: "Media",
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
  const { cliente, ticketCache, isLoadingTickets } = useCustomer();
  const initialFilters = useMemo(() => createDefaultFilters(), []);
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [searchResults, setSearchResults] = useState<ReadonlyArray<LocalTicketSummary>>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Cargar tickets desde el cache si existe, o cargar nuevos si no
  useEffect(() => {
    if (!cliente?.idCliente) {
      setSearchResults([]);
      setSelectedTicketId(null);
      return;
    }

    // Si hay tickets en cache y coincide el cliente, usarlos
    if (ticketCache && ticketCache.tickets && ticketCache.tickets.length > 0) {
      const mappedTickets = ticketCache.tickets.map(mapApiSummaryToLocal);
      setSearchResults(mappedTickets);
      setSelectedTicketId(mappedTickets[0]?.id ?? null);
    } else if (!isLoadingTickets) {
      // Solo cargar si no se están cargando ya en background
      loadTickets();
    }
  }, [cliente?.idCliente, ticketCache, isLoadingTickets]);

  const loadTickets = async () => {
    if (!cliente?.idCliente) return;
    
    try {
      const results = await ticketService.getTicketsByClienteId(cliente.idCliente);
      setSearchResults(results);
      setSelectedTicketId(results[0]?.id ?? null);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      setSearchResults([]);
    }
  };

  const handleSearch = useCallback(async (criteria: FilterCriteria) => {
    if (!cliente?.idCliente) {
      setSearchResults([]);
      setSelectedTicketId(null);
      return;
    }

    setIsFiltering(true);
    try {
      const results = await ticketService.searchTickets(criteria, cliente.idCliente);
      setFilters(criteria);
      setSearchResults(results);
      setSelectedTicketId(results[0]?.id ?? null);
    } catch (error: any) {
      console.error('Error al buscar tickets:', error);
      setSearchResults([]);
      setSelectedTicketId(null);
    } finally {
      setIsFiltering(false);
    }
  }, [cliente?.idCliente]);

  const handleSelectTicket = useCallback((ticketId: number) => {
    setSelectedTicketId(ticketId);
  }, []);

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

  const showLoadingIndicator = isLoadingTickets || isFiltering;

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Cliente:</span> {cliente.nombre} {cliente.apellido} (DNI: {cliente.dni})
        </p>
        {showLoadingIndicator && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs">Cargando tickets...</span>
          </div>
        )}
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
