import { useEffect, useState } from 'react';
import type { Encuesta } from './types/encuesta';
import encuestaService from './services/encuestaService';

export function useEncuestas() {
  const [data, setData] = useState<Encuesta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    encuestaService
      .list()
      .then((d) => setData(d))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
