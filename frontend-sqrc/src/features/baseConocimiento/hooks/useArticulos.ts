import { useState, useEffect, useCallback, useRef } from "react";
import articuloService from "../services/articuloService";
import type {
  ArticuloResumenResponse,
  ArticuloResponse,
  BusquedaArticuloRequest,
  PaginaResponse,
  Visibilidad,
} from "../types/articulo";

/**
 * Hook para buscar artículos con filtros y paginación.
 */
export function useArticulos(filtrosIniciales?: BusquedaArticuloRequest) {
  const [data, setData] =
    useState<PaginaResponse<ArticuloResumenResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filtros, setFiltros] = useState<BusquedaArticuloRequest>(
    filtrosIniciales || {}
  );

  const fetchData = useCallback(async (params: BusquedaArticuloRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await articuloService.buscarArticulos(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filtros);
  }, [filtros, fetchData]);

  const refetch = useCallback(() => {
    fetchData(filtros);
  }, [fetchData, filtros]);

  const buscar = useCallback((nuevosFiltros: BusquedaArticuloRequest) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros, pagina: 0 }));
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina }));
  }, []);

  return {
    data,
    articulos: data?.contenido || [],
    loading,
    error,
    filtros,
    buscar,
    cambiarPagina,
    refetch,
    paginacion: data
      ? {
          paginaActual: data.paginaActual,
          totalPaginas: data.totalPaginas,
          totalElementos: data.totalElementos,
          tieneAnterior: data.tieneAnterior,
          tieneSiguiente: data.tieneSiguiente,
        }
      : null,
  };
}

/**
 * Hook para obtener un artículo por ID.
 */
export function useArticulo(id: number | null) {
  const [data, setData] = useState<ArticuloResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await articuloService.obtenerPorId(id);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error al obtener artículo")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener artículos publicados.
 */
export function useArticulosPublicados() {
  const [data, setData] = useState<ArticuloResumenResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await articuloService.obtenerPublicados();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error al obtener artículos")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener mis artículos (del empleado actual).
 */
export function useMisArticulos(idEmpleado: number) {
  const [articulos, setArticulos] = useState<ArticuloResumenResponse[]>([]);
  const [borradores, setBorradores] = useState<ArticuloResumenResponse[]>([]);
  const [deprecados, setDeprecados] = useState<ArticuloResumenResponse[]>([]);
  const [populares, setPopulares] = useState<ArticuloResumenResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!idEmpleado) return;
    setLoading(true);
    setError(null);
    try {
      const [articulosRes, borradoresRes, deprecadosRes, popularesRes] =
        await Promise.all([
          articuloService.obtenerMisArticulos(idEmpleado),
          articuloService.obtenerMisBorradores(idEmpleado),
          articuloService.obtenerDeprecados(),
          articuloService.obtenerPopulares(5),
        ]);
      setArticulos(articulosRes);
      setBorradores(borradoresRes);
      setDeprecados(deprecadosRes);
      setPopulares(popularesRes);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error al obtener datos")
      );
    } finally {
      setLoading(false);
    }
  }, [idEmpleado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    articulos,
    borradores,
    deprecados,
    populares,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook para obtener versiones de un artículo.
 */
export function useVersiones(idArticulo: number | null) {
  const [data, setData] = useState<
    import("../types/articulo").ArticuloVersionResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!idArticulo) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const result = await articuloService.obtenerVersiones(idArticulo);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error al obtener versiones")
      );
    } finally {
      setLoading(false);
    }
  }, [idArticulo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para buscar sugerencias de artículos por palabras clave.
 * Incluye debounce para evitar llamadas excesivas mientras el usuario escribe.
 *
 * @param debounceMs - Tiempo de espera antes de buscar (default: 300ms)
 */
export function useSugerenciasArticulos(debounceMs = 300) {
  const [sugerencias, setSugerencias] = useState<ArticuloResumenResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [palabrasClave, setPalabrasClave] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(
    (texto: string, visibilidad?: Visibilidad, limite = 4) => {
      setPalabrasClave(texto);

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si no hay texto, limpiar sugerencias
      if (!texto.trim()) {
        setSugerencias([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Debounce: esperar antes de buscar
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await articuloService.buscarSugerencias(
            texto.trim(),
            limite,
            visibilidad
          );
          setSugerencias(result);
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error
              ? err
              : new Error("Error al buscar sugerencias")
          );
          setSugerencias([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const limpiar = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSugerencias([]);
    setPalabrasClave("");
    setLoading(false);
    setError(null);
  }, []);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    sugerencias,
    loading,
    error,
    palabrasClave,
    buscar,
    limpiar,
    tieneSugerencias: sugerencias.length > 0,
  };
}
