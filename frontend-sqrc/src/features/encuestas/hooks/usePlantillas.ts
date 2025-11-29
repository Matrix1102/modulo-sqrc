import { useState, useEffect, useCallback } from 'react';

export function usePlantillas() {
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const svc = (await import('../services/encuestaService')).encuestaService;
      const data = await svc.plantillasList();
      // debug: log backend response length
      // eslint-disable-next-line no-console
      console.debug('[usePlantillas] fetched', Array.isArray(data) ? data.length : typeof data);
      setItems(data || []);
      setError(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[usePlantillas] error fetching plantillas', err);
      try {
        const showToast = (await import('../../../services/notification')).default;
        // try to surface server message if present
        // @ts-ignore
        const msg = err?.response?.data || err?.message || 'Error fetching plantillas';
        showToast(String(msg), 'error');
      } catch (e) {
        // ignore
      }
      setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getActive = useCallback((alcance: string) => {
    if (!items) return null;
    return items.find((p) => (p.alcanceEvaluacion || p.tipo) === alcance && ((p.estado || '').toUpperCase() === 'ACTIVA')) || null;
  }, [items]);

  const addLocal = useCallback((tpl: any) => {
    setItems((prev) => {
      if (!prev) return [tpl];
      // prepend new template
      return [tpl, ...prev];
    });
  }, []);

  const updateLocal = useCallback((tpl: any) => {
    setItems((prev) => {
      if (!prev) return [tpl];
      return prev.map((p) => {
        const idP = p.templateId ?? p.id;
        const idT = tpl.templateId ?? tpl.id;
        if (String(idP) === String(idT)) return { ...p, ...tpl };
        return p;
      });
    });
  }, []);

  return { items, loading, error, reload: load, getActive, addLocal, updateLocal } as const;
}

export default usePlantillas;
