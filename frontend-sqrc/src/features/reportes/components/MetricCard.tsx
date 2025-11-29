import React, { useState } from "react";
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
    valueText: string;
    color: string;
    barColor: string;
    label: string;
  };
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
  /** Optional custom menu (rendered when clicking the three-dots).
   * If provided, it is a function that receives a `close` callback so the menu
   * can request the card to close it after an action (e.g. selection).
   */
  menu?: (close: () => void) => React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  value,
  stats,
  progress,
  trend,
  loading = false,
  menu,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative flex flex-col items-center">
        <div className="absolute top-4 right-4 p-1 rounded"></div>

        <div className="mb-3 text-center w-full">
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto animate-pulse"></div>
        </div>

        <div className="mb-4 w-full">
          <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        </div>

        <div className="w-full">
          <div className="h-3 bg-gray-100 rounded w-full animate-pulse mb-2"></div>
          <div className="h-2 bg-gray-100 rounded w-5/6 animate-pulse"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative flex flex-col items-center">
      {/* Menú de 3 puntos */}
      <div className="absolute top-4 right-4 p-1">
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <MoreVertical size={18} className="text-gray-400" />
        </button>
        {menuOpen && menu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-10 p-1">
            {menu(closeMenu)}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-3 text-center w-full">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* Valor principal */}
      <div className="mb-4">
        <p className="text-5xl font-bold text-gray-900">{value}</p>
      </div>

      {/* Stats (para Total Casos) */}
      {stats && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{stat.label}:</span>
              <span
                className="text-base font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {progress && (
        <div className="w-full">
          <div className="flex items-center justify-center mb-2">
            <span className={`text-xs font-semibold ${progress.color}`}>
              {progress.label} {progress.valueText}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${progress.barColor}`}
              style={{ width: `${progress.value}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trend.isPositive ? (
            <TrendingUp size={16} className="text-green-600" />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
          <span
            className={`text-xs font-bold ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-xs text-gray-500">de semana anterior</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
