import { MetricCard } from "../../features/reportes/components/MetricCard";
import { SurveyTable } from "../../features/encuestas/components/SurveyTable";
import { TemplatesSection } from "../../features/encuestas/components/TemplateSection";

export default function EncuestasPage() {
  return (
    <div className="space-y-6">
      {/* Grid de 4 Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CSAT Promedio (Agente)"
          subtitle="Calificación promedio de la atención del agente"
          value="4.3/5"
          progress={{
            value: 86,
            color: "bg-green-500",
            label: "+0.5 vs semana anterior",
          }}
        />

        <MetricCard
          title="CSAT Promedio (Servicio)"
          subtitle="Calificación promedio de la atención del servicio"
          value="4.1/5"
          progress={{
            value: 82,
            color: "bg-green-500",
            label: "+0.5 vs semana anterior",
          }}
        />

        <MetricCard
          title="Total Respuestas"
          subtitle="Nro. de encuestas completadas por clientes."
          value={21}
          progress={{
            value: 42,
            color: "bg-green-500",
            label: "+2 vs semana anterior",
          }}
        />

        <MetricCard
          title="Tasa de Respuestas"
          subtitle="Porcentaje de encuestas respondidas"
          value="18%"
          progress={{
            value: 18,
            color: "bg-green-500",
            label: "+2.5 vs semana anterior",
          }}
        />
      </div>

      {/* Grid de 2 columnas con las tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SurveyTable type="agents" />
        <SurveyTable type="services" />
      </div>

      <TemplatesSection />
    </div>
  );
}
