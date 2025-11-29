import React from 'react';
import type { DesgloseTipo } from '../types/reporte';

interface Props {
  data: DesgloseTipo[] | undefined;
}

export const ChannelDistribution: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="bg-white p-4 rounded-lg border border-gray-100">No data for this channel.</div>;
  }

  const total = data.reduce((s, d) => s + (d.cantidad || 0), 0);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Distribución por tipo</h3>
      <div className="space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.cantidad / total) * 100) : 0;
          return (
            <div key={d.tipo} className="flex items-center gap-3">
              <div className="w-36 text-sm text-gray-700">{d.tipo}</div>
              <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                <div className="h-4 bg-primary-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="w-20 text-sm text-gray-600 text-right">{d.cantidad} ({pct}%)</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelDistribution;
