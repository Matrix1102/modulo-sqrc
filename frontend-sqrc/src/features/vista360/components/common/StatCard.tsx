import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatCardVariant = "blue" | "emerald" | "amber" | "purple" | "rose" | "cyan";

interface Props {
  title: string;
  value: React.ReactNode;
  trendValue?: string;
  trendDirection?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  variant?: StatCardVariant;
}

const variantStyles: Record<StatCardVariant, {
  bg: string;
  iconBg: string;
  iconText: string;
  border: string;
  glow: string;
}> = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    iconText: "text-white",
    border: "border-blue-100",
    glow: "shadow-blue-100",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    iconText: "text-white",
    border: "border-emerald-100",
    glow: "shadow-emerald-100",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    iconText: "text-white",
    border: "border-amber-100",
    glow: "shadow-amber-100",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
    iconBg: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    iconText: "text-white",
    border: "border-purple-100",
    glow: "shadow-purple-100",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-50 to-pink-50",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    iconText: "text-white",
    border: "border-rose-100",
    glow: "shadow-rose-100",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
    iconBg: "bg-gradient-to-br from-cyan-500 to-sky-600",
    iconText: "text-white",
    border: "border-cyan-100",
    glow: "shadow-cyan-100",
  },
};

const StatCard: React.FC<Props> = ({ 
  title, 
  value, 
  trendValue, 
  trendDirection = "neutral",
  icon,
  variant = "blue"
}) => {
  const styles = variantStyles[variant];

  const getTrendStyles = () => {
    switch (trendDirection) {
      case "positive":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: <TrendingUp size={14} />,
        };
      case "negative":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <TrendingDown size={14} />,
        };
      case "neutral":
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: <Minus size={14} />,
        };
    }
  };

  const trendStyles = getTrendStyles();

  return (
    <div 
      className={`
        relative flex h-full flex-col rounded-2xl border ${styles.border} ${styles.bg} 
        p-6 shadow-lg ${styles.glow} transition-all duration-300 
        hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
      `}
    >
      {/* Icono centrado arriba */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className={`
            flex items-center justify-center w-14 h-14 rounded-xl 
            ${styles.iconBg} ${styles.iconText} shadow-lg
          `}>
            {icon}
          </div>
        </div>
      )}

      {/* Título centrado */}
      <h3 className="text-sm font-semibold text-gray-600 text-center mb-3">
        {title}
      </h3>

      {/* Valor principal centrado */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-900 tracking-tight text-center">
          {value}
        </div>
      </div>

      {/* Tendencia centrada */}
      {trendValue && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-center">
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
            ${trendStyles.bg} ${trendStyles.text} text-xs font-semibold
          `}>
            {trendStyles.icon}
            <span>{trendValue}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
