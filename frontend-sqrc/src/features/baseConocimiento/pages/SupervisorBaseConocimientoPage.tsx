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
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabConfig[] = [
  {
    key: "estadisticas",
    label: "Resumen",
    Icon: BarChart3,
  },
  {
    key: "todos",
    label: "Todos los artículos",
    Icon: Globe,
  },
  {
    key: "mis-articulos",
    label: "Mis artículos",
    Icon: FolderOpen,
  },
  {
    key: "crear",
    label: "Crear Artículo",
    Icon: FilePlus,
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
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          BASE DE CONOCIMIENTO
        </h1>
      </div>

      {/* Main Card with Tabs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Tab Navigation - Estilo horizontal uniforme */}
        <nav className="bg-white">
          <ul className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <li key={tab.key} className="min-w-40 flex-1 sm:min-w-0">
                  <button
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-center text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "border-b-2 border-blue-500 bg-blue-50 text-blue-600"
                          : "border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    aria-selected={isActive}
                  >
                    <tab.Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="border-t border-gray-100">
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
    </section>
  );
};

export default SupervisorBaseConocimientoPage;
