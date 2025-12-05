import { useLocation } from "react-router-dom";
import { useMemo, useCallback } from "react";

interface UseBasePathReturn {
  /** La ruta base completa (ej: /agente-llamada/base-conocimiento) */
  basePath: string;
  /** Función para construir rutas completas */
  buildPath: (path: string) => string;
}

/**
 * Hook que extrae la ruta base de la Base de Conocimiento según el rol actual.
 *
 * Detecta automáticamente el prefijo de ruta basado en la URL actual:
 * - /agente-llamada/base-conocimiento
 * - /agente-presencial/base-conocimiento
 * - /backoffice/base-conocimiento
 * - /supervisor/base-conocimiento (si existe)
 *
 * @returns Objeto con basePath y función buildPath
 */
export function useBasePath(): UseBasePathReturn {
  const location = useLocation();

  const basePath = useMemo(() => {
    const path = location.pathname;

    // Detectar el prefijo de rol en la ruta
    const rolePrefixes = [
      "/agente-llamada/base-conocimiento",
      "/agente-presencial/base-conocimiento",
      "/backoffice/base-conocimiento",
      "/supervisor/base-conocimiento",
    ];

    for (const prefix of rolePrefixes) {
      if (path.startsWith(prefix)) {
        return prefix;
      }
    }

    // Fallback: extraer la ruta base hasta "base-conocimiento"
    const match = path.match(/^(\/[^/]+\/base-conocimiento)/);
    if (match) {
      return match[1];
    }

    // Default fallback
    return "/base-conocimiento";
  }, [location.pathname]);

  const buildPath = useCallback(
    (path: string) => {
      // Si la ruta ya empieza con /, la concatenamos directamente
      // Si no, agregamos un / entre el basePath y la ruta
      if (path.startsWith("/")) {
        return `${basePath}${path}`;
      }
      return path ? `${basePath}/${path}` : basePath;
    },
    [basePath]
  );

  return { basePath, buildPath };
}

export default useBasePath;
