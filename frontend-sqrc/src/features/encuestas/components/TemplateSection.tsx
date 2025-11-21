import { TemplateCard } from "./TemplateCard";

export const TemplatesSection: React.FC = () => {
  const handleCrear = (templateName: string) => {
    console.log("Crear plantilla:", templateName);
  };

  const handleModificar = (templateName: string) => {
    console.log("Modificar plantilla:", templateName);
  };

  const handleEliminar = (templateName: string) => {
    console.log("Eliminar plantilla:", templateName);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">
        Plantillas de encuesta
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TemplateCard
          title="Encuesta sobre Agente"
          onCrear={() => handleCrear("Agente")}
          onModificar={() => handleModificar("Agente")}
          onEliminar={() => handleEliminar("Agente")}
        />
        <TemplateCard
          title="Encuesta sobre Servicio"
          onCrear={() => handleCrear("Servicio")}
          onModificar={() => handleModificar("Servicio")}
          onEliminar={() => handleEliminar("Servicio")}
        />
      </div>
    </div>
  );
};
