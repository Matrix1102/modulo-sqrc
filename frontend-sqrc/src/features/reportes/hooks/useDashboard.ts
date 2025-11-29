import { useEffect, useState } from 'react';
import reportService from '../services/reportService';
import type { DashboardKpis } from '../types/reporte';

export function useDashboard(params?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    reportService.fetchDashboard(params)
      .then((d) => {
        if (!mounted) return;
        setData(d);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [params?.startDate, params?.endDate]);

  return { data, loading, error };
}

export default useDashboard;
