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
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>

        {icon && <div className="rounded-md bg-white p-2 text-gray-500 shadow-inner">{icon}</div>}
      </div>

      {trendValue && (
        <div
          className={`mt-4 text-sm font-medium ${
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
