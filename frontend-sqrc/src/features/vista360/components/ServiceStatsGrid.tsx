import React from "react";
import StatCard from "./StatCard";
import { Clock, ArrowUpRight, Star, CheckCircle } from "lucide-react";
import type { MetricaKPI } from "../../../services/vista360Api";

interface Props {
  metricas?: MetricaKPI[];
  loading?: boolean;
}

const getIconForMetric = (titulo: string) => {
  if (titulo.includes("Tiempo")) return <Clock />;
  if (titulo.includes("Abiertos")) return <ArrowUpRight />;
  if (titulo.includes("Calificación")) return <Star />;
  if (titulo.includes("Último Mes") || titulo.includes("Mes")) return <CheckCircle />;
  return <Clock />;
};

const ServiceStatsGrid: React.FC<Props> = ({ metricas = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-h-[220px] animate-pulse">
            <div className="h-full rounded-xl border border-gray-200 bg-gray-50 p-5"></div>
          </div>
        ))}
      </div>
    );
  }

  if (metricas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-sm font-medium">No hay métricas disponibles</p>
          <p className="text-xs mt-1">Busca un cliente para ver sus estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-6">
      {metricas.map((metrica, index) => (
        <div key={index} className="min-h-[220px]">
          <StatCard
            title={metrica.titulo}
            value={
              metrica.unidad ? (
                <span>
                  {metrica.valorPrincipal}{" "}
                  <small className="text-base">{metrica.unidad}</small>
                </span>
              ) : (
                metrica.valorPrincipal
              )
            }
            trendValue={metrica.subtituloTendencia}
            trendDirection={
              metrica.estadoTendencia === "POSITIVO"
                ? "positive"
                : metrica.estadoTendencia === "NEGATIVO"
                ? "negative"
                : "neutral"
            }
            icon={getIconForMetric(metrica.titulo)}
          />
        </div>
      ))}
    </div>
  );
};

export default ServiceStatsGrid;
