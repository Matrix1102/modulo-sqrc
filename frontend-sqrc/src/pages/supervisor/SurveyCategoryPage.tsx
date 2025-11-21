import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SurveyTable } from "../../features/encuestas/components/SurveyTable";
import { TemplateCard } from "../../features/encuestas/components/TemplateCard";
import { TemplateEditModal } from "../../features/encuestas/components/TemplateEditModal";
import { SurveyDetailModal } from "../../features/encuestas/components/SurveyDetailModal";

interface SurveyCategoryPageProps {
  category: "AGENTE" | "SERVICIO";
}

export default function SurveyCategoryPage({
  category,
}: SurveyCategoryPageProps) {
  const navigate = useNavigate();

  // --- ESTADOS PARA MODALES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);

  // --- CONFIGURACIÓN DINÁMICA ---
  const config = {
    AGENTE: {
      title: "Encuestas sobre agentes",
      description:
        "Administra las plantillas de las encuestas y mira los resultados",
      tableType: "agents" as const,
    },
    SERVICIO: {
      title: "Encuestas sobre servicio",
      description:
        "Administra las plantillas de las encuestas y mira los resultados",
      tableType: "services" as const,
    },
  };

  const currentConfig = config[category];

  // --- MANEJADORES ---

  // 1. Abrir modal de detalle al hacer clic en una fila
  const handleViewDetail = (data: any) => {
    setSelectedSurvey(data);
    setIsDetailModalOpen(true);
  };

  // 2. Manejar acciones de la plantilla (Crear/Editar)
  const handleTemplateAction = (action: string) => {
    if (action === "CREATE") {
      setSelectedTemplate(null); // Limpiar para crear
    } else if (action === "EDIT") {
      // Simulación: Cargar plantilla actual
      setSelectedTemplate({
        id: 1,
        nombre: `Encuesta sobre ${
          category === "AGENTE" ? "Agente" : "Servicio"
        }`,
        descripcion: "Plantilla actual vigente...",
        preguntas: [],
      });
    }
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex flex-col space-y-8 pb-10">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            {currentConfig.title}
          </h1>
          <p className="text-gray-500 font-medium">
            {currentConfig.description}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-800 underline text-sm font-medium transition-colors"
        >
          Volver
        </button>
      </div>

      {/* --- SECCIÓN 1: TABLA DE RESULTADOS --- */}
      <div className="h-[500px]">
        {" "}
        {/* Altura fija o min-h para que se vea grande */}
        <SurveyTable
          type={currentConfig.tableType}
          onViewDetail={handleViewDetail}
          showViewAll={false} // Ocultamos el botón "Ver todos"
        />
      </div>

      {/* --- SECCIÓN 2: PLANTILLA ESPECÍFICA --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">
          Plantillas de encuesta
        </h3>
        <div className="max-w-3xl">
          {" "}
          {/* Limitamos el ancho para que no se estire demasiado */}
          <TemplateCard
            title={`Encuesta sobre ${
              category === "AGENTE" ? "Agente" : "Servicio"
            }`}
            type={category}
            description="Plantilla utilizada actualmente para este tipo de evaluación."
            onAction={handleTemplateAction}
          />
        </div>
      </div>

      {/* --- MODALES --- */}
      <TemplateEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        template={selectedTemplate}
      />

      <SurveyDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedSurvey}
      />
    </div>
  );
}
