import { useState } from "react";
import { MetricCard } from "../../features/reportes/components/MetricCard";
import { SurveyTable } from "../../features/encuestas/components/SurveyTable";
import { TemplatesSection } from "../../features/encuestas/components/TemplateSection";
import { SurveyDetailModal } from "../../features/encuestas/components/SurveyDetailModal";

export default function EncuestasPage() {
  // 1. Estados para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // 2. Función manejadora: Se pasa a las tablas para recibir el clic
  const handleOpenDetail = (surveyData: any) => {
    setSelectedSurvey(surveyData);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      {/* --- SECCIÓN 1: GRID DE MÉTRICAS SUPERIOR --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CSAT Promedio (Agente)"
          subtitle="Calificación promedio de la atención del agente"
          value="4.3/5"
          progress={{
            value: 86, // (4.3 / 5) * 100
            color: "bg-green-500",
            label: "+0.5 vs semana anterior",
          }}
        />

        <MetricCard
          title="CSAT Promedio (Servicio)"
          subtitle="Calificación promedio de la atención del servicio"
          value="4.1/5"
          progress={{
            value: 82, // (4.1 / 5) * 100
            color: "bg-green-500",
            label: "+0.5 vs semana anterior",
          }}
        />

        <MetricCard
          title="Total Respuestas"
          subtitle="Nro. de encuestas completadas por clientes."
          value={21}
          progress={{
            value: 42, // Valor arbitrario para la barra visual
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

      {/* --- SECCIÓN 2: TABLAS DE RESPUESTAS RECIENTES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla Izquierda: Sobre Agentes */}
        <SurveyTable
          type="agents"
          onViewDetail={handleOpenDetail} // Pasamos la función al hijo
        />

        {/* Tabla Derecha: Sobre Servicios */}
        <SurveyTable
          type="services"
          onViewDetail={handleOpenDetail} // Pasamos la función al hijo
        />
      </div>

      {/* --- SECCIÓN 3: GESTIÓN DE PLANTILLAS --- */}
      <TemplatesSection />

      {/* --- MODAL FLOTANTE (Controlado por el estado) --- */}
      <SurveyDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedSurvey}
      />
    </div>
  );
}
