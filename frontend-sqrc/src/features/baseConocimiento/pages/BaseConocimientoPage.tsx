import React, { useState } from "react";
import KBLayout from "../components/KBLayout";
import TodosArticulosView from "../components/TodosArticulosView";
import MisArticulosView from "../components/MisArticulosView";
import CrearArticuloView from "../components/CrearArticuloView";

const BaseConocimientoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("todos");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleArticuloCreated = () => {
    // Cambiar a la pestaña "Mis artículos" después de crear
    setActiveTab("mis-articulos");
  };

  return (
    <KBLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === "todos" && <TodosArticulosView />}
      {activeTab === "mis-articulos" && <MisArticulosView />}
      {activeTab === "crear" && (
        <CrearArticuloView onArticuloCreated={handleArticuloCreated} />
      )}
    </KBLayout>
  );
};

export default BaseConocimientoPage;
