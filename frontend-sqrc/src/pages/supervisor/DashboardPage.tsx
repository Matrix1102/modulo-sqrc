import { MetricCard } from "../../features/reportes/components/MetricCard";
import { FrequentReasons } from "../../features/reportes/components/FrequentReasons";
import { TopAgents } from "../../features/reportes/components/TopAgents";
import useDashboard from "../../features/reportes/hooks";

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

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
      {/* Grid de Métricas Principales - 4 en fila horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Casos"
          subtitle="Cantidad total de casos"
          value={kpis.kpisGlobales?.totalCasos ?? 0}
          stats={stats}
        />

        <MetricCard
          title="Tickets Abiertos"
          subtitle="Pendientes de atención"
          value={kpis.kpisResumen?.ticketsAbiertos?.valor ?? 0}
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
        <FrequentReasons reasons={motivos} />
        <TopAgents agents={agents} />
      </div>
    </div>
  );
}
