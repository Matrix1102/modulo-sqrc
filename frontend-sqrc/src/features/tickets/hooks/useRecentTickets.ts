import { useEffect, useState, useMemo } from "react";
import reportService from "../../reportes/services/reportService";
import type { AgenteDetail, TicketReporte } from "../../reportes/types/reporte";

// Interfaz para mejor tipado
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

  // Memoizar valores para evitar re-renders infinitos
  const agentIds = useMemo(
    () => (agentes ?? []).slice(0, 10).map((a) => a.agenteId),
    [agentes]
  );
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const maxItems = options?.maxItems ?? 30;

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (agentIds.length === 0) {
        setTickets([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const promises = agentIds.map((id) =>
          reportService.fetchTicketsByAgent(id, { startDate, endDate })
            .catch(() => ({ agenteId: id, tickets: [] }))
        );

        const results = await Promise.all(promises);

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

        if (mounted) {
          setTickets(all.slice(0, maxItems));
        }
      } catch (err: unknown) {
        if (mounted) {
          if (err instanceof Error) {
            setError(err);
          } else {
            setError(new Error(String(err)));
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [agentIds, startDate, endDate, maxItems]);

  return { tickets, loading, error };
}