import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { MetricCard } from "../../features/reportes/components/MetricCard";
import { FrequentReasons } from "../../features/reportes/components/FrequentReasons";
import { TopAgents } from "../../features/reportes/components/TopAgents";
import useDashboard from "../../features/reportes/hooks/useDashboard";

export default function DashboardPage() {
  const [rangeType, setRangeType] = useState<"today" | "week" | "month" | "custom">("week");
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  // derive startDate/endDate strings (yyyy-MM-dd) from selection
  const params = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (rangeType === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = start;
    } else if (rangeType === "week") {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = new Date(end);
      start.setDate(end.getDate() - 6);
    } else if (rangeType === "month") {
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = new Date(end);
      start.setMonth(end.getMonth() - 1);
      // keep same day offset
    } else if (rangeType === "custom") {
      start = range[0];
      end = range[1];
    }

    const toIso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);
    return { startDate: toIso(start), endDate: toIso(end) };
  }, [rangeType, range]);

  const { data, loading, error } = useDashboard(params);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard</div>;

  const kpis = data!;

  const stats =
    kpis.kpisGlobales?.desgloseTipo?.map((d, idx) => ({
      label: d.tipo,
      value: d.cantidad,
      color:
        idx === 1
          ? "text-red-600"
          : idx === 2
          ? "text-orange-600"
          : "text-primary-600",
    })) ?? [];

  const motivos = kpis.motivosFrecuentes.map((m) => ({
    label: m.motivo,
    count: m.cantidad,
  }));

  const agents = kpis.agentesMejorEvaluados.map((a) => ({
    name: a.nombre,
    tickets: a.tickets ?? 0,
    rating: a.rating,
  }));

  return (
    <div className="space-y-6">
      {/* Date range controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded ${rangeType === 'today' ? 'bg-primary-500 text-white' : 'bg-light-100'}`}
            onClick={() => { setRangeType('today'); setRange([null, null]); }}
          >
            Hoy
          </button>
          <button
            className={`px-3 py-1 rounded ${rangeType === 'week' ? 'bg-primary-500 text-white' : 'bg-light-100'}`}
            onClick={() => { setRangeType('week'); setRange([null, null]); }}
          >
            Última semana
          </button>
          <button
            className={`px-3 py-1 rounded ${rangeType === 'month' ? 'bg-primary-500 text-white' : 'bg-light-100'}`}
            onClick={() => { setRangeType('month'); setRange([null, null]); }}
          >
            Último mes
          </button>
          <button
            className={`px-3 py-1 rounded ${rangeType === 'custom' ? 'bg-primary-500 text-white' : 'bg-light-100'}`}
            onClick={() => { setRangeType('custom'); }}
          >
            Personalizado
          </button>
        </div>

        <div>
          {rangeType === 'custom' && (
            <div className="flex items-center gap-2">
              <DatePicker
                selectsRange
                startDate={range[0]}
                endDate={range[1]}
                onChange={(update: [Date | null, Date | null]) => { setRange(update); }}
                isClearable
                dateFormat="yyyy-MM-dd"
                showPopperArrow
                popperPlacement="bottom-start"
                popperClassName="react-datepicker-custom-popper"
                popperModifiers={( [{ name: 'preventOverflow', options: { boundary: document.body } }, { name: 'flip', options: { fallbackPlacements: ['top-start','bottom-start','top-end'] } }] as any)}
                placeholderText="Selecciona un rango"
                className="px-3 py-1 border border-neutral-200 rounded bg-light-100 text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <div className="text-sm text-dark-700">
                {range[0] ? range[0].toISOString().slice(0,10) : "-"} — {range[1] ? range[1].toISOString().slice(0,10) : "-"}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Grid de Métricas Principales - 4 en fila horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Casos"
          subtitle="Cantidad total de casos"
          value={kpis.kpisGlobales?.totalCasos ?? 0}
          loading={loading}
          stats={stats}
        />

        <MetricCard
          title="Tickets Abiertos"
          subtitle="Pendientes de atención"
          value={kpis.kpisResumen?.ticketsAbiertos?.valor ?? 0}
          loading={loading}
          progress={{
            value:
              kpis.kpisResumen?.ticketsAbiertos?.comparativoPeriodo_pct ??
              // derive a percent from totalCasos if pct not provided
              (kpis.kpisGlobales?.totalCasos &&
              Number(kpis.kpisResumen?.ticketsAbiertos?.valor) > 0
                ? Math.round(
                    (Number(kpis.kpisResumen?.ticketsAbiertos?.valor) /
                      kpis.kpisGlobales!.totalCasos) *
                      100
                  )
                : 0),
            valueText: "tickets",
            color: "text-red-600",
            barColor: "bg-red-500",
            label: (() => {
              const comp =
                kpis.kpisResumen?.ticketsAbiertos?.comparativoPeriodo;
              if (comp === null || comp === undefined) return "";
              return (comp > 0 ? "+" : "") + comp.toString();
            })(),
          }}
        />

        <MetricCard
          title="Tickets Resueltos"
          subtitle="Casos cerrados exitosamente"
          value={kpis.kpisResumen?.ticketsResueltos?.valor ?? 0}
          loading={loading}
          progress={{
            value:
              kpis.kpisResumen?.ticketsResueltos?.comparativoPeriodo_pct ??
              (kpis.kpisGlobales?.totalCasos &&
              Number(kpis.kpisResumen?.ticketsResueltos?.valor) > 0
                ? Math.round(
                    (Number(kpis.kpisResumen?.ticketsResueltos?.valor) /
                      kpis.kpisGlobales!.totalCasos) *
                      100
                  )
                : 0),
            valueText: "tickets",
            color: "text-success-600",
            barColor: "bg-success-500",
            label: (() => {
              const comp =
                kpis.kpisResumen?.ticketsResueltos?.comparativoPeriodo;
              if (comp === null || comp === undefined) return "";
              return (comp > 0 ? "+" : "") + comp.toString();
            })(),
          }}
        />

        <MetricCard
          title="Tiempo Promedio"
          subtitle="Tiempo de atención promedio"
          value={kpis.kpisResumen?.tiempoPromedio?.valor ?? "-"}
          loading={loading}
          trend={{
            value:
              (
                kpis.kpisResumen?.tiempoPromedio?.comparativoPeriodo_pct ?? 0
              ).toString() + "%",
            isPositive:
              (kpis.kpisResumen?.tiempoPromedio?.comparativoPeriodo_pct ?? 0) >=
              0,
          }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FrequentReasons reasons={motivos} loading={loading} />
        <TopAgents agents={agents} loading={loading} />
      </div>
    </div>
  );
}
