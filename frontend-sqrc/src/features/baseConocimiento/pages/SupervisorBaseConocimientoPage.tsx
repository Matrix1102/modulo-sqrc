import React, { useState, useRef, useCallback } from "react";
import { Globe, FolderOpen, BarChart3, FilePlus } from "lucide-react";
import SupervisorEstadisticasView from "../components/SupervisorEstadisticasView";
import SupervisorMisArticulosView from "../components/SupervisorMisArticulosView";
import SupervisorTodosArticulosView from "../components/SupervisorTodosArticulosView";
import CrearArticuloView, {
  type CrearArticuloViewRef,
} from "../components/CrearArticuloView";

type TabKey = "estadisticas" | "todos" | "mis-articulos" | "crear";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    key: "estadisticas",
    label: "Resumen",
    icon: <BarChart3 size={18} />,
  },
  {
    key: "todos",
    label: "Todos los artículos",
    icon: <Globe size={18} />,
  },
  {
    key: "mis-articulos",
    label: "Mis artículos",
    icon: <FolderOpen size={18} />,
  },
  {
    key: "crear",
    label: "Crear Artículo",
    icon: <FilePlus size={18} />,
  },
];

const SupervisorBaseConocimientoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("estadisticas");
  const crearArticuloRef = useRef<CrearArticuloViewRef>(null);

  const handleTabChange = useCallback(
    async (tab: TabKey) => {
      // Si estamos saliendo de la pestaña "crear" y hay contenido, guardar como borrador
      if (activeTab === "crear" && tab !== "crear") {
        if (crearArticuloRef.current?.tieneContenido()) {
          await crearArticuloRef.current.guardarBorrador();
        }
      }
      setActiveTab(tab);
    },
    [activeTab]
  );

  const handleArticuloCreated = useCallback(() => {
    // Cambiar a la pestaña "Mis artículos" después de crear
    setActiveTab("mis-articulos");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header con título */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            BASE DE CONOCIMIENTO
          </h1>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "estadisticas" && <SupervisorEstadisticasView />}
        {activeTab === "todos" && <SupervisorTodosArticulosView />}
        {activeTab === "mis-articulos" && <SupervisorMisArticulosView />}
        {activeTab === "crear" && (
          <div className="p-6">
            <CrearArticuloView
              ref={crearArticuloRef}
              onArticuloCreated={handleArticuloCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorBaseConocimientoPage;
