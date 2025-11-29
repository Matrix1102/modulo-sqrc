import { useEffect, useState } from "react";
import reportService from "../../reportes/services/reportService";
import type { AgenteDetail, TicketReporte } from "../../reportes/types/reporte";

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const agentList = agentes || [];
        // Limit concurrency: fetch tickets for up to first 10 agents to avoid flooding
        const limited = agentList.slice(0, 10);
        const promises = limited.map((a) => reportService.fetchTicketsByAgent(a.agenteId, params).catch((e) => ({ agenteId: a.agenteId, tickets: [] })));
        const results = await Promise.all(promises);
        // results may be AgentTickets shape
        const all: TicketReporte[] = [];
        for (const r of results) {
          if (!r) continue;
          const list = (r as any).tickets || [];
          for (const t of list) all.push(t as TicketReporte);
        }
        // sort by parsed date desc
        all.sort((a, b) => {
          const da = parseDateString(a.date)?.getTime() ?? 0;
          const db = parseDateString(b.date)?.getTime() ?? 0;
          return db - da;
        });
        const max = options?.maxItems ?? 30;
        if (mounted) setTickets(all.slice(0, max));
      } catch (err: any) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [agentes?.length, params?.startDate, params?.endDate]);

  return { tickets, loading, error };
}
