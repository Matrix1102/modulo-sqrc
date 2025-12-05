import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import articuloService from "../services/articuloService";
import type {
  ArticuloResumenResponse,
  ArticuloResponse,
  BusquedaArticuloRequest,
  PaginaResponse,
  Visibilidad,
} from "../types/articulo";

// Cache simple para evitar llamadas repetidas
const articuloCache = new Map<
  number,
  { data: ArticuloResponse; timestamp: number }
>();
const CACHE_TTL = 30000; // 30 segundos

// Cache para búsquedas
const searchCache = new Map<
  string,
  { data: PaginaResponse<ArticuloResumenResponse>; timestamp: number }
>();
const SEARCH_CACHE_TTL = 10000; // 10 segundos

function getCachedArticulo(id: number): ArticuloResponse | null {
  const cached = articuloCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedArticulo(id: number, data: ArticuloResponse) {
  articuloCache.set(id, { data, timestamp: Date.now() });
}

function getCacheKey(params: BusquedaArticuloRequest): string {
  return JSON.stringify(params);
}

function getCachedSearch(
  params: BusquedaArticuloRequest
): PaginaResponse<ArticuloResumenResponse> | null {
  const key = getCacheKey(params);
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedSearch(
  params: BusquedaArticuloRequest,
  data: PaginaResponse<ArticuloResumenResponse>
) {
  const key = getCacheKey(params);
  searchCache.set(key, { data, timestamp: Date.now() });
  // Limpiar cache viejo (máximo 20 entradas)
  if (searchCache.size > 20) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }
}

/**
 * Hook para buscar artículos con filtros y paginación.
 * Optimizado con debounce, cache y abort controller.
 */
export function useArticulos(
  filtrosIniciales?: BusquedaArticuloRequest,
  debounceMs = 250
) {
  const [data, setData] =
    useState<PaginaResponse<ArticuloResumenResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filtros, setFiltros] = useState<BusquedaArticuloRequest>(
    filtrosIniciales || {}
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedRef = useRef<string>("");

  const fetchData = useCallback(
    async (params: BusquedaArticuloRequest, _skipDebounce = false) => {
      const paramsKey = getCacheKey(params);

      // Evitar fetch duplicado
      if (paramsKey === lastFetchedRef.current && data) {
        return;
      }

      // Verificar cache primero
      const cached = getCachedSearch(params);
      if (cached) {
        setData(cached);
        lastFetchedRef.current = paramsKey;
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await articuloService.buscarArticulos(params);
        setData(result);
        setCachedSearch(params, result);
        lastFetchedRef.current = paramsKey;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        setLoading(false);
      }
    },
    [data]
  );

  // Efecto con debounce
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce para textos de búsqueda, inmediato para otros filtros
    const hasSearchText = filtros.texto && filtros.texto.length > 0;
    const delay = hasSearchText ? debounceMs : 0;

    debounceTimerRef.current = setTimeout(() => {
      fetchData(filtros);
    }, delay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filtros, debounceMs, fetchData]);

  const refetch = useCallback(() => {
    // Invalidar cache al refetch
    const key = getCacheKey(filtros);
    searchCache.delete(key);
    lastFetchedRef.current = "";
    fetchData(filtros, true);
  }, [fetchData, filtros]);

  const buscar = useCallback((nuevosFiltros: BusquedaArticuloRequest) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros, pagina: 0 }));
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina }));
  }, []);

  // Memoizar artículos para evitar re-renders innecesarios
  const articulos = useMemo(() => data?.contenido || [], [data?.contenido]);

  const paginacion = useMemo(
    () =>
      data
        ? {
            paginaActual: data.paginaActual,
            totalPaginas: data.totalPaginas,
            totalElementos: data.totalElementos,
            tieneAnterior: data.tieneAnterior,
            tieneSiguiente: data.tieneSiguiente,
          }
        : null,
    [data]
  );

  return {
    data,
    articulos,
    loading,
    error,
    filtros,
    buscar,
    cambiarPagina,
    refetch,
    paginacion,
  };
}

/**
 * Hook para obtener un artículo por ID con cache.
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

    // Intentar obtener del cache primero
    const cached = getCachedArticulo(id);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await articuloService.obtenerPorId(id);
      setData(result);
      setCachedArticulo(id, result);
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

  const refetch = useCallback(() => {
    // Invalidar cache al refetch
    if (id) articuloCache.delete(id);
    fetchData();
  }, [fetchData, id]);

  return { data, loading, error, refetch };
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
