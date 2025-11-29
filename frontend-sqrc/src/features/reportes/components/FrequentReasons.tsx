import React from "react";
import { MoreVertical } from "lucide-react";

interface Reason {
  label: string;
  count: number;
  color?: string;
}

interface FrequentReasonsProps {
  reasons?: Reason[];
  loading?: boolean;
}

export const FrequentReasons: React.FC<FrequentReasonsProps> = ({
  reasons = [
    { label: "Retraso en entrega", count: 8, color: "bg-primary-500" },
    { label: "Error en facturación", count: 7, color: "bg-primary-500" },
    { label: "Problemas técnicos", count: 7, color: "bg-primary-500" },
    { label: "Consulta general", count: 6, color: "bg-primary-500" },
  ],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-28 animate-pulse"></div>
          </div>
            <div className="h-6 w-6 rounded animate-pulse bg-gray-200" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-12 animate-pulse"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full bg-gray-200`} style={{ width: `${60}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...reasons.map((r) => r.count));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-dark-900">
            Motivos frecuentes
          </h3>
          <p className="text-xs text-neutral-400">
            Motivos más frecuentes de los tickets
          </p>
        </div>
        <button className="p-1 hover:bg-light-200 rounded">
          <MoreVertical size={18} className="text-neutral-400" />
        </button>
      </div>

      <div className="space-y-4">
        {reasons.map((reason, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-700">{reason.label}</span>
                <span className="text-sm font-semibold text-dark-900">
                  {reason.count}
                </span>
              </div>
              <div className="w-full bg-light-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    reason.color || "bg-primary-500"
                  }`}
                  style={{ width: `${(reason.count / maxCount) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
