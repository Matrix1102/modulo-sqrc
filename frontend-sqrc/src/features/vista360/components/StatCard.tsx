import React from "react";

interface Props {
  title: string;
  value: React.ReactNode;
  trendValue?: string;
  trendDirection?: "positive" | "negative";
  icon?: React.ReactNode;
}

const StatCard: React.FC<Props> = ({ title, value, trendValue, trendDirection = "positive", icon }) => {
  return (
    <div className="relative flex h-full flex-col rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm">
      {icon && (
        <div className="absolute right-5 top-5 rounded-md bg-white p-2 text-gray-500 shadow-inner">
          {icon}
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="mt-4 text-4xl font-bold text-gray-900">{value}</div>
      </div>

      {trendValue && (
        <div
          className={`mt-6 text-center text-sm font-semibold ${
            trendDirection === "positive" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {trendValue}
        </div>
      )}
    </div>
  );
};

export default StatCard;
