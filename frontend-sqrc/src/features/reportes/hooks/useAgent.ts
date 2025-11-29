import { useEffect, useState, useCallback } from 'react';
import reportService from '../services/reportService';
import type { AgenteDetail } from '../types/reporte';

export function useAgentes(params?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<AgenteDetail[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (p?: { startDate?: string; endDate?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const d = await reportService.fetchAgentes(p);
      setData(d);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [load, params?.startDate, params?.endDate]);

  return { data, loading, error, refetch: () => load(params) };
}

export default useAgentes;
