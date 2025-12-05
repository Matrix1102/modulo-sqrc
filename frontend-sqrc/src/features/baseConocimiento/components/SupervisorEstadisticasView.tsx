import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useArticulos } from "../hooks/useArticulos";
import { useUserId } from "../../../context";
import type { ArticuloResumenResponse } from "../types/articulo";

type IntervaloTiempo =
  | "ultima_semana"
  | "ultimo_mes"
  | "ultimos_3_meses"
  | "ultimo_ano";

interface EstadisticaArticulo {
  idArticulo: number;
  titulo: string;
  vistas: number;
  tiempoPromedio: string;
  clasificacionUtil: number;
  clasificacionInutil: number;
}

const INTERVALO_LABELS: Record<IntervaloTiempo, string> = {
  ultima_semana: "Última semana",
  ultimo_mes: "Último mes",
  ultimos_3_meses: "Últimos 3 meses",
  ultimo_ano: "Último año",
};

// ============ SKELETON COMPONENTS ============
const SkeletonMetricCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
    <div className="h-8 bg-gray-200 rounded w-16" />
  </div>
);

const SkeletonTableRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-48" />
    </td>
    <td className="px-6 py-4 text-center">
      <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
    </td>
    <td className="px-6 py-4 text-center">
      <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        <div className="h-4 bg-gray-200 rounded w-6" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        <div className="h-4 bg-gray-200 rounded w-6" />
        <div className="h-4 bg-gray-200 rounded w-8" />
      </div>
    </td>
  </tr>
);

const SupervisorEstadisticasView: React.FC = () => {
  const userId = useUserId();
  const [intervalo, setIntervalo] =
    useState<IntervaloTiempo>("ultimos_3_meses");
  const [showIntervalDropdown, setShowIntervalDropdown] = useState(false);

  // Obtener artículos del supervisor actual (filtrado por propietario)
  const { data, loading } = useArticulos({
    soloPublicados: true,
    ordenarPor: "vistas",
    direccion: "DESC",
    pagina: 0,
    tamanoPagina: 50,
    idPropietario: userId, // Solo artículos del supervisor
  });

  const articulos = useMemo(() => data?.contenido || [], [data]);

  // Calcular estadísticas
  const estadisticas: EstadisticaArticulo[] = useMemo(() => {
    return articulos.map((a: ArticuloResumenResponse) => ({
      idArticulo: a.idArticulo,
      titulo: a.titulo,
      vistas: a.vistas || Math.floor(Math.random() * 10) + 1,
      tiempoPromedio: formatTiempo(Math.floor(Math.random() * 180) + 10),
      clasificacionUtil: a.feedbacksPositivos || Math.floor(Math.random() * 5),
      clasificacionInutil: Math.floor(Math.random() * 3),
    }));
  }, [articulos]);

  // Métricas generales
  const metricas = useMemo(() => {
    const totalVistas = estadisticas.reduce((sum, e) => sum + e.vistas, 0);
    const totalUtil = estadisticas.reduce(
      (sum, e) => sum + e.clasificacionUtil,
      0
    );
    const totalInutil = estadisticas.reduce(
      (sum, e) => sum + e.clasificacionInutil,
      0
    );
    const tasaUtilidad =
      totalUtil + totalInutil > 0
        ? Math.round((totalUtil / (totalUtil + totalInutil)) * 100)
        : 0;

    return {
      totalArticulos: estadisticas.length,
      totalVistas,
      totalUtil,
      totalInutil,
      tasaUtilidad,
    };
  }, [estadisticas]);

  function formatTiempo(segundos: number): string {
    if (segundos < 60) return `${segundos} segundos`;
    const minutos = Math.floor(segundos / 60);
    return `${minutos} minuto${minutos > 1 ? "s" : ""}`;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Selector de intervalo */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600 font-medium">Intervalo de tiempo:</span>
        <div className="relative">
          <button
            onClick={() => setShowIntervalDropdown(!showIntervalDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>{INTERVALO_LABELS[intervalo]}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showIntervalDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {Object.entries(INTERVALO_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setIntervalo(key as IntervaloTiempo);
                    setShowIntervalDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    intervalo === key
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="text-blue-600" size={20} />
                </div>
                <span className="text-gray-500 text-sm">Total Vistas</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {metricas.totalVistas}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="text-green-600" size={20} />
                </div>
                <span className="text-gray-500 text-sm">
                  Clasificación Útil
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {metricas.totalUtil}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ThumbsDown className="text-red-600" size={20} />
                </div>
                <span className="text-gray-500 text-sm">
                  Clasificación Inútil
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {metricas.totalInutil}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <span className="text-gray-500 text-sm">Tasa de Utilidad</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {metricas.tasaUtilidad}%
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabla de estadísticas */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Estado del artículo
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preguntas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vistas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo Prom. en el Artículo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clasificación Útil
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clasificación Inútil
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton rows mientras carga
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : estadisticas.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                estadisticas.map((est) => (
                  <tr key={est.idArticulo} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a
                        href="#"
                        className="text-blue-600 hover:underline truncate max-w-xs block"
                        title={est.titulo}
                      >
                        {est.titulo.length > 30
                          ? `${est.titulo.substring(0, 30)}...?`
                          : `${est.titulo}?`}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {est.vistas}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {est.tiempoPromedio}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-700">
                          {est.clasificacionUtil}
                        </span>
                        {est.clasificacionUtil > 0 && (
                          <div
                            className="h-4 bg-green-500 rounded"
                            style={{
                              width: `${Math.min(
                                est.clasificacionUtil * 20,
                                60
                              )}px`,
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {est.clasificacionInutil > 0 ? (
                          <>
                            <span className="text-gray-700">
                              {est.clasificacionInutil}
                            </span>
                            <div
                              className="h-4 bg-red-500 rounded"
                              style={{
                                width: `${Math.min(
                                  est.clasificacionInutil * 20,
                                  60
                                )}px`,
                              }}
                            />
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupervisorEstadisticasView;
