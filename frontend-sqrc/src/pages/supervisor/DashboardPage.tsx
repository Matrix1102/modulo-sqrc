import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { MetricCard } from "../../features/reportes/components/MetricCard";
import { FrequentReasons } from "../../features/reportes/components/FrequentReasons";
import { TopAgents } from "../../features/reportes/components/TopAgents";
import ChannelDistribution from "../../features/reportes/components/ChannelDistribution";
import ChannelMenu from "../../features/reportes/components/ChannelMenu";
import useDashboard from "../../features/reportes/hooks/useDashboard";

export default function DashboardPage() {
  const [rangeType, setRangeType] = useState<
    "today" | "week" | "month" | "custom"
  >("week");
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

    const toIso = (d: Date | null) =>
      d ? d.toISOString().slice(0, 10) : undefined;
    return { startDate: toIso(start), endDate: toIso(end) };
  }, [rangeType, range]);

  const { data, loading, error } = useDashboard(params);

  // channel UI state must be declared at top-level (before any early returns)
  const [cardChannels, setCardChannels] = useState<Record<string, string>>({
    total: "GLOBAL",
    abiertos: "GLOBAL",
    resueltos: "GLOBAL",
    tiempo: "GLOBAL",
  });

  // derive available channels from the (possibly undefined) data so menu nodes render consistently
  const rawChannelKeys = Object.keys(data?.kpisGlobales?.desglosePorCanal || {});
  // ensure GLOBAL is present and first (default)
  const channelKeys = ["GLOBAL", ...rawChannelKeys.filter((k) => k !== "GLOBAL")];

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard</div>;

  const kpis = data!;

  // per-card channel selection: use the `cardChannels` mapping to show channel-scoped stats in each card
  const stats =
    (kpis.kpisGlobales?.desglosePorCanal?.[cardChannels.total] || []).map(
      (d, idx) => ({
        label: d.tipo,
        value: d.cantidad,
        color:
          idx === 1
            ? "text-red-600"
            : idx === 2
            ? "text-orange-600"
            : "text-primary-600",
      })
    ) ?? [];

  const totalCasesForCard =
    kpis.kpisGlobales?.desglosePorCanal?.[cardChannels.total]?.reduce(
      (s: number, x: any) => s + (x.cantidad || 0),
      0
    ) ??
    kpis.kpisGlobales?.totalCasos ??
    0;

  // ChannelMenu component is used as the menu prop for MetricCard

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
            className={`px-3 py-1 rounded ${
              rangeType === "today"
                ? "bg-primary-500 text-white"
                : "bg-light-100"
            }`}
            onClick={() => {
              setRangeType("today");
              setRange([null, null]);
            }}
          >
            Hoy
          </button>
          <button
            className={`px-3 py-1 rounded ${
              rangeType === "week"
                ? "bg-primary-500 text-white"
                : "bg-light-100"
            }`}
            onClick={() => {
              setRangeType("week");
              setRange([null, null]);
            }}
          >
            Última semana
          </button>
          <button
            className={`px-3 py-1 rounded ${
              rangeType === "month"
                ? "bg-primary-500 text-white"
                : "bg-light-100"
            }`}
            onClick={() => {
              setRangeType("month");
              setRange([null, null]);
            }}
          >
            Último mes
          </button>
          <button
            className={`px-3 py-1 rounded ${
              rangeType === "custom"
                ? "bg-primary-500 text-white"
                : "bg-light-100"
            }`}
            onClick={() => {
              setRangeType("custom");
            }}
          >
            Personalizado
          </button>
        </div>

        <div>
          {rangeType === "custom" && (
            <div className="flex items-center gap-2">
              <DatePicker
                selectsRange
                startDate={range[0]}
                endDate={range[1]}
                onChange={(update: [Date | null, Date | null]) => {
                  setRange(update);
                }}
                isClearable
                dateFormat="yyyy-MM-dd"
                showPopperArrow
                popperPlacement="bottom-start"
                popperClassName="react-datepicker-custom-popper"
                popperModifiers={
                  [
                    {
                      name: "preventOverflow",
                      options: { boundary: document.body },
                    },
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: [
                          "top-start",
                          "bottom-start",
                          "top-end",
                        ],
                      },
                    },
                  ] as any
                }
                placeholderText="Selecciona un rango"
                className="px-3 py-1 border border-neutral-200 rounded bg-light-100 text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <div className="text-sm text-dark-700">
                {range[0] ? range[0].toISOString().slice(0, 10) : "-"} —{" "}
                {range[1] ? range[1].toISOString().slice(0, 10) : "-"}
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
          value={totalCasesForCard}
          loading={loading}
          stats={stats}
          menu={(close) => (
            <ChannelMenu
              channels={channelKeys}
              selected={cardChannels.total}
              onSelect={(ch) => {
                setCardChannels((prev) => ({ ...prev, total: ch }));
                close();
              }}
            />
          )}
        />

        <MetricCard
          title="Tickets Abiertos"
          subtitle="Pendientes de atención"
          value={
            kpis.kpisResumen?.[cardChannels.abiertos]?.ticketsAbiertos?.valor ??
            0
          }
          loading={loading}
          menu={(close) => (
            <ChannelMenu
              channels={channelKeys}
              selected={cardChannels.abiertos}
              onSelect={(ch) => {
                setCardChannels((prev) => ({ ...prev, abiertos: ch }));
                close();
              }}
            />
          )}
          progress={{
            value:
              kpis.kpisResumen?.[cardChannels.abiertos]?.ticketsAbiertos
                ?.comparativoPeriodo_pct ??
              // derive a percent from totalCasos if pct not provided
              (kpis.kpisGlobales?.totalCasos &&
              Number(
                kpis.kpisResumen?.[cardChannels.abiertos]?.ticketsAbiertos
                  ?.valor
              ) > 0
                ? Math.round(
                    (Number(
                      kpis.kpisResumen?.[cardChannels.abiertos]?.ticketsAbiertos
                        ?.valor
                    ) /
                      kpis.kpisGlobales!.totalCasos) *
                      100
                  )
                : 0),
            valueText: "tickets",
            color: "text-red-600",
            barColor: "bg-red-500",
            label: (() => {
              const comp =
                kpis.kpisResumen?.[cardChannels.abiertos]?.ticketsAbiertos
                  ?.comparativoPeriodo;
              if (comp === null || comp === undefined) return "";
              return (comp > 0 ? "+" : "") + comp.toString();
            })(),
          }}
        />

        <MetricCard
          title="Tickets Resueltos"
          subtitle="Casos cerrados exitosamente"
          value={
            kpis.kpisResumen?.[cardChannels.resueltos]?.ticketsResueltos
              ?.valor ?? 0
          }
          loading={loading}
          menu={(close) => (
            <ChannelMenu
              channels={channelKeys}
              selected={cardChannels.resueltos}
              onSelect={(ch) => {
                setCardChannels((prev) => ({ ...prev, resueltos: ch }));
                close();
              }}
            />
          )}
          progress={{
            value:
              kpis.kpisResumen?.[cardChannels.resueltos]?.ticketsResueltos
                ?.comparativoPeriodo_pct ??
              (kpis.kpisGlobales?.totalCasos &&
              Number(
                kpis.kpisResumen?.[cardChannels.resueltos]?.ticketsResueltos
                  ?.valor
              ) > 0
                ? Math.round(
                    (Number(
                      kpis.kpisResumen?.[cardChannels.resueltos]
                        ?.ticketsResueltos?.valor
                    ) /
                      kpis.kpisGlobales!.totalCasos) *
                      100
                  )
                : 0),
            valueText: "tickets",
            color: "text-success-600",
            barColor: "bg-success-500",
            label: (() => {
              const comp =
                kpis.kpisResumen?.[cardChannels.resueltos]?.ticketsResueltos
                  ?.comparativoPeriodo;
              if (comp === null || comp === undefined) return "";
              return (comp > 0 ? "+" : "") + comp.toString();
            })(),
          }}
        />

        <MetricCard
          title="Tiempo Promedio"
          subtitle="Tiempo de atención promedio"
          value={
            kpis.kpisResumen?.[cardChannels.tiempo]?.tiempoPromedio?.valor ??
            "-"
          }
          loading={loading}
          menu={(close) => (
            <ChannelMenu
              channels={channelKeys}
              selected={cardChannels.tiempo}
              onSelect={(ch) => {
                setCardChannels((prev) => ({ ...prev, tiempo: ch }));
                close();
              }}
            />
          )}
          trend={{
            value:
              (
                kpis.kpisResumen?.[cardChannels.tiempo]?.tiempoPromedio
                  ?.comparativoPeriodo_pct ?? 0
              ).toString() + "%",
            isPositive:
              (kpis.kpisResumen?.[cardChannels.tiempo]?.tiempoPromedio
                ?.comparativoPeriodo_pct ?? 0) >= 0,
          }}
        />
      </div>
      <div className="flex items-start gap-6">
        <div className="w-full lg:w-1/2">
          <FrequentReasons reasons={motivos} loading={loading} />
        </div>

        <div className="w-full lg:w-1/2 space-y-4">
          <TopAgents agents={agents} loading={loading} />
        </div>
      </div>
    </div>
  );
}
