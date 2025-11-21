import { useState } from "react";
import { History } from "lucide-react"; // Icono para el historial
import { TemplateCard } from "./TemplateCard";
import { TemplateEditModal } from "./TemplateEditModal";
import { TemplateHistoryModal } from "./TemplateHistoryModal";

export const TemplatesSection = () => {
  // Estados para controlar qué modal se muestra
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // <--- NUEVO

  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  // Manejador de acciones de las tarjetas
  const handleCardAction = (action: string, type: string) => {
    if (action === "EDIT") {
      // Simulación: Cargar la plantilla vigente de ese tipo
      setActiveTemplate({
        id: 1,
        nombre: `Encuesta sobre ${
          type === "AGENTE" ? "Agente" : "Servicio"
        } (Vigente)`,
        descripcion: "Versión actual visible para los clientes",
        preguntas: [
          { id: 1, texto: "¿Cómo calificarías la atención?", tipo: "RATING" },
        ],
      });
      setIsEditModalOpen(true);
    } else if (action === "CREATE") {
      // Abrir modal vacío para crear nueva versión
      setActiveTemplate({ nombre: "", descripcion: "", preguntas: [] });
      setIsEditModalOpen(true);
    }
    // DELETE logic...
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* --- HEADER DE LA SECCIÓN --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">
            Plantillas de Encuesta
          </h3>
          <p className="text-sm text-gray-500">
            Gestiona las preguntas que se envían a los clientes
          </p>
        </div>

        {/* BOTÓN VER HISTORIAL */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          <History size={18} />
          Ver Historial y Versiones
        </button>
      </div>

      {/* --- GRID DE TARJETAS (Vigentes) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TemplateCard
          title="Encuesta sobre Agente"
          type="AGENTE"
          description="Evalúa el desempeño personal"
          onAction={handleCardAction}
        />
        <TemplateCard
          title="Encuesta sobre Servicio"
          type="SERVICIO"
          description="Evalúa la satisfacción general"
          onAction={handleCardAction}
        />
      </div>

      {/* --- MODALES --- */}

      {/* 1. Modal de Edición (Crear/Modificar) */}
      <TemplateEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        template={activeTemplate}
      />

      {/* 2. Modal de Historial (Ver antiguas) */}
      <TemplateHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};
