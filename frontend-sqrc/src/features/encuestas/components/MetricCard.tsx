import React from "react";
import { MoreVertical, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  stats?: {
    label: string;
    value: number;
    color: string;
  }[];
  progress?: {
    value: number;
    color: string;
    label: string;
  };
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  value,
  stats,
  progress,
  trend,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 relative flex flex-col items-center">
      {/* Menú de 3 puntos */}
      <button className="absolute top-4 right-4 p-1 hover:bg-light-200 rounded transition-colors">
        <MoreVertical size={18} className="text-neutral-400" />
      </button>

      {/* Header */}
      <div className="mb-3 text-center w-full">
        <h3 className="text-sm font-bold text-dark-900 mb-1">{title}</h3>
        <p className="text-xs text-dark-500">{subtitle}</p>
      </div>

      {/* Valor principal */}
      <div className="mb-4">
        <p className="text-5xl font-bold text-dark-900">{value}</p>
      </div>

      {/* Stats (para Total Casos) */}
      {stats && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full">
          {stats.map((stat, index) => (
            <div key={index} className="text-left">
              <p className="text-xs text-dark-600 mb-1">
                {stat.label}:{" "}
                <span className={`text-base font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {progress && (
        <div className="w-full">
          <div className="flex items-center justify-center mb-2">
            <span className="text-xs font-semibold text-success-600">
              {progress.label}
            </span>
          </div>
          <div className="w-full bg-light-300 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${progress.color}`}
              style={{ width: `${progress.value}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trend.isPositive ? (
            <TrendingUp size={16} className="text-success-600" />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
          <span
            className={`text-xs font-bold ${
              trend.isPositive ? "text-success-600" : "text-red-600"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-xs text-dark-500">de semana anterior</span>
        </div>
      )}
    </div>
  );
};
