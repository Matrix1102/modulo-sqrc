import React, { useState, useRef, useCallback } from "react";
import KBLayout from "../components/KBLayout";
import TodosArticulosView from "../components/TodosArticulosView";
import MisArticulosView from "../components/MisArticulosView";
import CrearArticuloView, { type CrearArticuloViewRef } from "../components/CrearArticuloView";

const BaseConocimientoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("todos");
  const crearArticuloRef = useRef<CrearArticuloViewRef>(null);

  const handleTabChange = useCallback(async (tab: string) => {
    // Si estamos saliendo de la pestaña "crear" y hay contenido, guardar como borrador
    if (activeTab === "crear" && tab !== "crear") {
      if (crearArticuloRef.current?.tieneContenido()) {
        await crearArticuloRef.current.guardarBorrador();
      }
    }
    setActiveTab(tab);
  }, [activeTab]);

  const handleArticuloCreated = useCallback(() => {
    // Cambiar a la pestaña "Mis artículos" después de crear
    setActiveTab("mis-articulos");
  }, []);

  return (
    <KBLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === "todos" && <TodosArticulosView />}
      {activeTab === "mis-articulos" && <MisArticulosView />}
      {activeTab === "crear" && (
        <CrearArticuloView 
          ref={crearArticuloRef}
          onArticuloCreated={handleArticuloCreated} 
        />
      )}
    </KBLayout>
  );
};

export default BaseConocimientoPage;
