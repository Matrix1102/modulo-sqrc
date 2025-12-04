import { useEffect, useState } from "react";
import reportService from "../../reportes/services/reportService";
import type { AgenteDetail, TicketReporte } from "../../reportes/types/reporte";

// 1. Rescatamos la interfaz de la izquierda para mejor tipado
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

  // 2. Usamos la estructura de useEffect directo (como en la derecha) 
  // para manejar la bandera 'mounted' y evitar memory leaks.
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const agentList = agentes || [];
        // Limit concurrency: fetch tickets for up to first 10 agents
        const limited = agentList.slice(0, 10);
        
        const promises = limited.map((a) =>
          reportService.fetchTicketsByAgent(a.agenteId, params)
            .catch(() => ({ agenteId: a.agenteId, tickets: [] }))
        );

        const results = await Promise.all(promises);

        // 3. Usamos el tipado estricto de la izquierda (sin 'any')
        const all: TicketReporte[] = [];
        for (const r of results) {
          if (!r) continue;
          const result = r as AgentTicketsResult; // Cast seguro gracias a la interfaz
          const list = result.tickets || [];
          for (const t of list) all.push(t);
        }

        // sort by parsed date desc
        all.sort((a, b) => {
          const da = parseDateString(a.date)?.getTime() ?? 0;
          const db = parseDateString(b.date)?.getTime() ?? 0;
          return db - da;
        });

        const max = options?.maxItems ?? 30;
        
        if (mounted) {
          setTickets(all.slice(0, max));
        }
      } catch (err: unknown) {
        if (mounted) {
            // 4. Mejor manejo de errores (de la izquierda)
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
    // 5. Dependencias estables (de la derecha) para evitar re-renders infinitos
  }, [agentes?.length, params?.startDate, params?.endDate, options?.maxItems]);

  return { tickets, loading, error };
}