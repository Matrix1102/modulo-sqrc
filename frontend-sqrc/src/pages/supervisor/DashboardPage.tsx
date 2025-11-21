import { MetricCard } from "../../features/encuestas/components/MetricCard";
import { FrequentReasons } from "../../features/encuestas/components/FrequentReasons";
import { TopAgents } from "../../features/encuestas/components/TopAgents";
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Grid de Métricas Principales - 4 en fila horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Casos"
          subtitle="Cantidad total de casos"
          value={24}
          stats={[
            { label: "Solicitudes", value: 4, color: "text-primary-600" },
            { label: "Reclamos", value: 10, color: "text-red-600" },
            { label: "Quejas", value: 8, color: "text-orange-600" },
            { label: "Solicitudes", value: 2, color: "text-success-600" },
          ]}
        />

        <MetricCard
          title="Tickets Abiertos"
          subtitle="Pendientes de atención"
          value={12}
          progress={{
            value: 45,
            color: "bg-red-500",
            label: "+10 Esta semana",
          }}
        />

        <MetricCard
          title="Tickets Resueltos"
          subtitle="Casos cerrados exitosamente"
          value={10}
          progress={{
            value: 65,
            color: "bg-success-500",
            label: "+8 Esta semana",
          }}
        />

        <MetricCard
          title="Tiempo Promedio"
          subtitle="Tiempo de atención promedio"
          value="2.4 hrs"
          trend={{
            value: "-12%",
            isPositive: true,
          }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FrequentReasons />
        <TopAgents />
      </div>
    </div>
  );
}
