import { useState } from "react";
import DateRangeFilter from "../../components/DateRangeFilter";
import { MetricCard } from "../../features/reportes/components/MetricCard";
import { FrequentReasons } from "../../features/reportes/components/FrequentReasons";
import { TopAgents } from "../../features/reportes/components/TopAgents";
import ChannelMenu from "../../features/reportes/components/ChannelMenu";
import useDashboard from "../../features/reportes/hooks/useDashboard";

export default function DashboardPage() {
  const [params, setParams] = useState<{ startDate?: string; endDate?: string } | undefined>(undefined);
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

  // Do not short-circuit rendering on loading/error: show skeletons per-component instead.
  // Provide a safe empty shape so the page can render while data is loading or if there's an error.
  const kpis: any =
    data ?? {
      kpisGlobales: { totalCasos: 0, desglosePorCanal: { GLOBAL: [] } },
      kpisResumen: {},
      motivosFrecuentes: [],
      agentesMejorEvaluados: [],
    };

  // per-card channel selection: use the `cardChannels` mapping to show channel-scoped stats in each card
  const stats =
    (kpis.kpisGlobales?.desglosePorCanal?.[cardChannels.total] || []).map(
      (d: any, idx: number) => ({
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

  const motivos = (kpis.motivosFrecuentes || []).map((m: any) => ({
    label: m.motivo,
    count: m.cantidad,
  }));

  const agents = (kpis.agentesMejorEvaluados || []).map((a: any) => ({
    name: a.nombre,
    tickets: a.tickets ?? 0,
    rating: a.rating,
  }));

  const uiLoading = loading || Boolean(error);

  // Helper to build progress props for metric cards
  const buildProgress = (kind: "abiertos" | "resueltos") => {
    const resumen = kpis.kpisResumen?.[cardChannels[kind === "abiertos" ? "abiertos" : "resueltos"]];
    const key = kind === "abiertos" ? "ticketsAbiertos" : "ticketsResueltos";
    const item = resumen?.[key];

    // comparativo absolute and percent
    const compAbs = item?.comparativoPeriodo ?? null;
    const compPct = item?.comparativoPeriodo_pct ?? null;

    // rawPercent is the real percent we want to show (may be >100)
    const rawPercent = compPct ?? (kpis.kpisGlobales?.totalCasos && Number(item?.valor) > 0
      ? (Number(item?.valor) / kpis.kpisGlobales.totalCasos) * 100
      : 0);

    // Determine color rules:
    // - Tickets Abiertos: increase is BAD -> red when comp > 0, green when comp < 0
    // - Tickets Resueltos: increase is GOOD -> green when comp > 0, red when comp < 0
    let textColor = "text-gray-600";
    let barColor = "bg-gray-400";
    // Determine sign from absolute comparativo if available; otherwise unknown (0)
    const sign = compAbs === null ? 0 : (compAbs > 0 ? 1 : compAbs < 0 ? -1 : 0);

    if (kind === "abiertos") {
      if (sign > 0) {
        textColor = "text-red-600";
        barColor = "bg-red-500";
      } else if (sign < 0) {
        textColor = "text-green-600";
        barColor = "bg-green-500";
      }
    } else {
      // resueltos
      if (sign > 0) {
        textColor = "text-green-600";
        barColor = "bg-green-500";
      } else if (sign < 0) {
        textColor = "text-red-600";
        barColor = "bg-red-500";
      }
    }

    return {
      // bar shows capped magnitude (0..100)
      value: Math.min(Math.max(Math.abs(rawPercent), 0), 100),
      // show only the numeric change label in the card (e.g. "+43 tickets")
      valueText: "tickets",
      color: textColor,
      barColor: barColor,
      label: compAbs === null || compAbs === undefined ? "" : (compAbs > 0 ? "+" : "") + compAbs.toString(),
    };
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-100">
          Error cargando el dashboard — se muestran datos parciales o placeholders.
        </div>
      )}
      {/* Date range controls (shared component) */}
      <DateRangeFilter onChange={(p) => setParams(p)} initialRange="week" />
      <div className="h-3" />
      {/* Grid de Métricas Principales - 4 en fila horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Casos"
          subtitle="Cantidad total de casos"
          value={totalCasesForCard}
          loading={uiLoading}
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
          loading={uiLoading}
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
          progress={buildProgress("abiertos")}
        />

        <MetricCard
          title="Tickets Resueltos"
          subtitle="Casos cerrados exitosamente"
          value={
            kpis.kpisResumen?.[cardChannels.resueltos]?.ticketsResueltos
              ?.valor ?? 0
          }
          loading={uiLoading}
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
          progress={buildProgress("resueltos")}
        />

        <MetricCard
          title="Tiempo Promedio"
          subtitle="Tiempo de atención promedio"
          value={
            kpis.kpisResumen?.[cardChannels.tiempo]?.tiempoPromedio?.valor ??
            "-"
          }
          loading={uiLoading}
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
          <FrequentReasons reasons={motivos} loading={uiLoading} />
        </div>

        <div className="w-full lg:w-1/2 space-y-4">
          <TopAgents agents={agents} loading={uiLoading} />
        </div>
      </div>
    </div>
  );
}
