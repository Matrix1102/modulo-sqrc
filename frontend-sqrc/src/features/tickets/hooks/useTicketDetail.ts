import { useState, useEffect, useCallback } from "react";
import { ticketApi } from "../services/ticketApi";
import type { TicketDetail } from "../types";

interface UseTicketDetailResult {
  ticket: TicketDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTicketDetail(ticketId: string | number | undefined): UseTicketDetailResult {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ticketApi.getTicketById(Number(ticketId));
      setTicket(response);
    } catch (err: any) {
      console.error("Error fetching ticket detail:", err);
      setError(err.message || "Error al cargar el ticket");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    loading,
    error,
    refetch: fetchTicket,
  };
}
