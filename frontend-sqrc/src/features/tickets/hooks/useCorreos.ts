/**
 * Hook para gestionar el hilo de correos de un ticket
 */

import { useState, useEffect } from 'react';
import { getCorreos } from '../services/ticketApi';
import type { CorreoDTO } from '../types';

interface UseCorreosResult {
  correos: CorreoDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y gestionar el hilo de correos de un ticket
 * 
 * @param ticketId ID del ticket
 * @returns Estado con correos, loading, error y función refetch
 */
export function useCorreos(ticketId: number | null): UseCorreosResult {
  const [correos, setCorreos] = useState<CorreoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCorreos = async () => {
    if (!ticketId) {
      setCorreos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCorreos(ticketId);
      setCorreos(data);
    } catch (err) {
      console.error('Error al cargar correos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorreos();
  }, [ticketId]);

  return {
    correos,
    loading,
    error,
    refetch: fetchCorreos,
  };
}
