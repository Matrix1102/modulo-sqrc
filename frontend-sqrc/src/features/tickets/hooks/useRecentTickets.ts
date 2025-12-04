import { useEffect, useState } from "react";
import reportService from "../../reportes/services/reportService";
import type { AgenteDetail, TicketReporte } from "../../reportes/types/reporte";

export default function useRecentTickets(
  _agentes?: AgenteDetail[] | null, // Mantenido para compatibilidad, ya no se usa
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
        const max = options?.maxItems ?? 30;
        // Usar el nuevo endpoint eficiente para obtener todos los tickets recientes
        const recentTickets = await reportService.fetchTicketsRecientes({
          startDate: params?.startDate,
          endDate: params?.endDate,
          limit: max
        });
        
        if (mounted) {
          setTickets(recentTickets as TicketReporte[]);
        }
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
  }, [params?.startDate, params?.endDate, options?.maxItems]);

  return { tickets, loading, error };
}

