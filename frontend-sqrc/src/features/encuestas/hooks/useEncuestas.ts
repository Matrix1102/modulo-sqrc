import { useCallback, useEffect, useState } from 'react';
import encuestaService from '../services/encuestaService';

export interface EncuestasParams {
  estado?: string;
  limit?: number;
  page?: number;
  size?: number;
}

export const useEncuestas = (params?: EncuestasParams) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (p?: EncuestasParams) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await encuestaService.listarEncuestas(p as any);
      setData(resp || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [load, params?.estado, params?.limit, params?.page, params?.size]);

  return { data, loading, error, refetch: () => load(params) };
};

export default useEncuestas;
