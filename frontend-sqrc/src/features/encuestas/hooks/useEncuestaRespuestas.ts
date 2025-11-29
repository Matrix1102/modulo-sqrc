import { useCallback, useEffect, useState } from "react";
import reportService from "../../reportes/services/reportService";

export interface EncuestaParams {
  alcanceEvaluacion?: "AGENTE" | "SERVICIO" | string;
  agenteId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  size?: number;
}

export const useEncuestaRespuestas = (params?: EncuestaParams) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (p?: EncuestaParams) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await reportService.fetchEncuestaRespuestas(p as any);
      setData(resp || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [load, params?.alcanceEvaluacion, params?.agenteId, params?.startDate, params?.endDate, params?.limit, params?.page, params?.size]);

  return { data, loading, error, refetch: () => load(params) };
};

export default useEncuestaRespuestas;
