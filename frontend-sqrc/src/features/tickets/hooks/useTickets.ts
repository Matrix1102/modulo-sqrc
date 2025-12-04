import { useState, useEffect, useCallback } from "react";
import { ticketApi } from "../services/ticketApi";
import type { TicketListItem, TicketFilters, PageResponse } from "../types";

interface UseTicketsResult {
  tickets: TicketListItem[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
  setPage: (page: number) => void;
}

export function useTickets(filters: TicketFilters = {}): UseTicketsResult {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ticketApi.getTickets({
        ...filters,
        page: currentPage,
        size: 10,
      });

      // Handle both paginated and array responses
      if (Array.isArray(response)) {
        setTickets(response);
        setTotalElements(response.length);
        setTotalPages(1);
      } else {
        const pageResponse = response as PageResponse<TicketListItem>;
        setTickets(pageResponse.content || []);
        setTotalElements(pageResponse.totalElements || 0);
        setTotalPages(pageResponse.totalPages || 0);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err instanceof Error ? err.message : "Error al cargar los tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    tickets,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    refetch: fetchTickets,
    setPage,
  };
}
