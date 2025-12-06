import React from "react";
import { StatCard, type StatCardVariant } from "../../common";
import { Clock, TicketCheck, Star, CalendarCheck, Wallet, CreditCard } from "lucide-react";
import type { MetricaKPI } from "../../../../../services/vista360Api";

interface Props {
  metricas?: MetricaKPI[];
  loading?: boolean;
  saldoProductos?: number;
  saldoServicios?: number;
}

// Configuración de cada métrica con su ícono y variante de color
const metricConfig: Record<string, { icon: React.ReactNode; variant: StatCardVariant }> = {
  "Tiempo Promedio de Solución": { 
    icon: <Clock size={24} strokeWidth={2} />, 
    variant: "blue" 
  },
  "Tickets Abiertos": { 
    icon: <TicketCheck size={24} strokeWidth={2} />, 
    variant: "blue" 
  },
  "Calificación de la Atención": { 
    icon: <Star size={24} strokeWidth={2} />, 
    variant: "blue" 
  },
  "Tickets del Último Mes": { 
    icon: <CalendarCheck size={24} strokeWidth={2} />, 
    variant: "blue" 
  },
  "Saldo Productos": { 
    icon: <CreditCard size={24} strokeWidth={2} />, 
    variant: "blue" 
  },
  "Saldo Servicios": { 
    icon: <Wallet size={24} strokeWidth={2} />, 
    variant: "blue" 
  },
};

const defaultConfig = { 
  icon: <Clock size={24} strokeWidth={2} />, 
  variant: "cyan" as StatCardVariant 
};

const getMetricConfig = (titulo: string) => {
  // Buscar coincidencia exacta o parcial
  for (const [key, config] of Object.entries(metricConfig)) {
    if (titulo.includes(key) || key.includes(titulo)) {
      return config;
    }
  }
  
  // Fallback basado en palabras clave
  if (titulo.toLowerCase().includes("tiempo")) {
    return metricConfig["Tiempo Promedio de Solución"];
  }
  if (titulo.toLowerCase().includes("abierto")) {
    return metricConfig["Tickets Abiertos"];
  }
  if (titulo.toLowerCase().includes("calificación") || titulo.toLowerCase().includes("rating")) {
    return metricConfig["Calificación de la Atención"];
  }
  if (titulo.toLowerCase().includes("mes") || titulo.toLowerCase().includes("último")) {
    return metricConfig["Tickets del Último Mes"];
  }
  
  return defaultConfig;
};

const ServiceStatsGrid: React.FC<Props> = ({ metricas = [], loading = false, saldoProductos = 0, saldoServicios = 0 }) => {
  // Solo mostrar métricas de saldo cuando hay métricas del cliente (es decir, hay cliente cargado)
  const hasCliente = metricas.length > 0;
  
  // Crear métricas adicionales de saldo solo si hay cliente
  const saldoMetricas: MetricaKPI[] = hasCliente ? [
    {
      titulo: "Saldo Productos",
      valorPrincipal: `S/ ${saldoProductos.toFixed(2)}`,
      unidad: "",
      subtituloTendencia: saldoProductos === 0 ? "Sin deuda" : "Pendiente de pago",
      estadoTendencia: saldoProductos === 0 ? "POSITIVO" : "NEGATIVO",
    },
    {
      titulo: "Saldo Servicios",
      valorPrincipal: `S/ ${saldoServicios.toFixed(2)}`,
      unidad: "",
      subtituloTendencia: saldoServicios === 0 ? "Sin deuda" : "Pendiente de pago",
      estadoTendencia: saldoServicios === 0 ? "POSITIVO" : "NEGATIVO",
    },
  ] : [];

  // Combinar métricas originales con las de saldo
  const allMetricas = [...metricas, ...saldoMetricas];
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-[180px] animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg mt-4"></div>
              <div className="h-6 w-28 bg-gray-200 rounded-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allMetricas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-dashed border-gray-300">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock size={32} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-700">No hay métricas disponibles</p>
          <p className="text-sm text-gray-500 mt-1">Busca un cliente para ver sus estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {allMetricas.map((metrica, index) => {
        const config = getMetricConfig(metrica.titulo);
        
        return (
          <div key={index} className="h-[200px]">
            <StatCard
              title={metrica.titulo}
              value={
                metrica.unidad ? (
                  <span className="flex items-baseline gap-1">
                    {metrica.valorPrincipal}
                    <span className="text-lg font-medium text-gray-500">{metrica.unidad}</span>
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
              icon={config.icon}
              variant={config.variant}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ServiceStatsGrid;
