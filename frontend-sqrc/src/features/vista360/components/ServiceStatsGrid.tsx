import React from "react";
import StatCard from "./StatCard";
import { Clock, ArrowUpRight, Star, CheckCircle } from "lucide-react";

const ServiceStatsGrid: React.FC = () => {
  return (
    <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-6">
      <StatCard
        title="Tiempo Promedio de Solución"
        value={<span>2.4 <small className="text-base">hrs</small></span>}
        trendValue="-12% vs mes anterior"
        trendDirection="positive"
        icon={<Clock />}
      />

      <StatCard
        title="Tickets Abiertos"
        value={3}
        trendValue="+2 del promedio"
        trendDirection="negative"
        icon={<ArrowUpRight />}
      />

      <StatCard
        title="Calificación de la Atención"
        value={<span>4.2<span className="text-gray-500">/5</span></span>}
        trendValue="+0.3 este mes"
        trendDirection="positive"
        icon={<Star />}
      />

      <StatCard
        title="Tickets del Ultimo Mes"
        value={5}
        trendValue="75% de tasa de resolución"
        trendDirection="positive"
        icon={<CheckCircle />}
      />
    </div>
  );
};

export default ServiceStatsGrid;
