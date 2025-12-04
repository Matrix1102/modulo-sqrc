import { useEffect, useState, useCallback } from "react";
import reportService from "../../reportes/services/reportService";
import type { AgenteDetail, TicketReporte } from "../../reportes/types/reporte";

interface AgentTicketsResult {
  agenteId: string;
  tickets: TicketReporte[];
}

function parseDateString(d?: string): Date | null {
  if (!d) return null;
  // Try formats: yyyy-MM-dd or dd/MM/yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d);
  const parts = d.split("/");
  if (parts.length === 3) {
    const dd = Number(parts[0]);
    const mm = Number(parts[1]) - 1;
    const yyyy = Number(parts[2]);
    return new Date(yyyy, mm, dd);
  }
  const parsed = Date.parse(d);
  return isNaN(parsed) ? null : new Date(parsed);
}

export default function useRecentTickets(
  agentes: AgenteDetail[] | null | undefined,
  params?: { startDate?: string; endDate?: string },
  options?: { maxItems?: number }
) {
  const [tickets, setTickets] = useState<TicketReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const maxItems = options?.maxItems ?? 30;

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const agentList = agentes || [];
      // Limit concurrency: fetch tickets for up to first 10 agents to avoid flooding
      const limited = agentList.slice(0, 10);
      const promises = limited.map((a) => 
        reportService.fetchTicketsByAgent(a.agenteId, params)
          .catch(() => ({ agenteId: a.agenteId, tickets: [] }))
      );
      const results = await Promise.all(promises);
      // results may be AgentTickets shape
      const all: TicketReporte[] = [];
      for (const r of results) {
        if (!r) continue;
        const result = r as AgentTicketsResult;
        const list = result.tickets || [];
        for (const t of list) all.push(t);
      }
      // sort by parsed date desc
      all.sort((a, b) => {
        const da = parseDateString(a.date)?.getTime() ?? 0;
        const db = parseDateString(b.date)?.getTime() ?? 0;
        return db - da;
      });
      setTickets(all.slice(0, maxItems));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(String(err)));
      }
    } finally {
      setLoading(false);
    }
  }, [agentes, params, maxItems]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return { tickets, loading, error };
}
