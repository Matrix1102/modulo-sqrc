import { useState } from "react";
import { History } from "lucide-react"; // Icono para el historial
import { TemplateCard } from "./TemplateCard";
import { TemplateEditModal } from "./TemplateEditModal";
import { TemplateHistoryModal } from "./TemplateHistoryModal";
import usePlantillas from "../hooks/usePlantillas";
import showToast from "../../../services/notification";
import showConfirm from "../../../services/confirm";
import { encuestaService } from "../services/encuestaService";

export const TemplatesSection = () => {
  // Estados para controlar qué modal se muestra
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // <--- NUEVO

  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const { items: _plantillas, loading: plantillasLoading, reload, getActive, addLocal, updateLocal } = usePlantillas();

  // Manejador de acciones de las tarjetas
  const handleCardAction = async (action: string, type: string) => {
    const active = getActive(type);
    if (action === "EDIT") {
      if (!active) {
        showToast('No hay plantilla vigente para editar', 'warning');
        return;
      }
      setActiveTemplate(active);
      setIsEditModalOpen(true);
    } else if (action === "CREATE") {
      // Crear nueva versión (si quieres bloquear creación cuando ya existe, ajusta canCreate)
      setActiveTemplate({ nombre: "", descripcion: "", preguntas: [], alcanceEvaluacion: type === "AGENTE" ? "AGENTE" : "SERVICIO" });
      setIsEditModalOpen(true);
    } else if (action === "DELETE") {
      if (!active) {
        showToast('No hay plantilla vigente para desactivar', 'warning');
        return;
      }
      // use non-blocking confirm modal
      const ok = await showConfirm('¿Deseas desactivar la plantilla vigente?', 'Confirmar');
      if (!ok) return;
      try {
        await encuestaService.plantillaDelete(active.templateId || active.id);
        showToast('Plantilla desactivada', 'success');
        await reload();
      } catch (err) {
        console.error(err);
        showToast('Error al desactivar plantilla', 'error');
      }
    }
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
          canEdit={!!getActive('AGENTE')}
          canDelete={!!getActive('AGENTE')}
          canCreate={true}
          loading={plantillasLoading}
        />
        <TemplateCard
          title="Encuesta sobre Servicio"
          type="SERVICIO"
          description="Evalúa la satisfacción general"
          onAction={handleCardAction}
          canEdit={!!getActive('SERVICIO')}
          canDelete={!!getActive('SERVICIO')}
          canCreate={true}
          loading={plantillasLoading}
        />
      </div>

      {/* --- MODALES --- */}

      {/* 1. Modal de Edición (Crear/Modificar) */}
      <TemplateEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        template={activeTemplate}
        onSaved={(createdOrUpdated) => {
          // If we created a new plantilla, add it optimistically to the list
          if (createdOrUpdated && (!activeTemplate || !activeTemplate.id)) {
            addLocal(createdOrUpdated);
            return;
          }
          // Otherwise update the local item if present, or reload as fallback
          if (createdOrUpdated) {
            updateLocal(createdOrUpdated);
          } else {
            void reload();
          }
        }}
      />

      {/* 2. Modal de Historial (Ver antiguas) */}
      <TemplateHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};
