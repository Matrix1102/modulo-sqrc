import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import KBLayout from "../components/KBLayout";
import TodosArticulosView from "../components/TodosArticulosView";
import MisArticulosView from "../components/MisArticulosView";
import CrearArticuloView, {
  type CrearArticuloViewRef,
} from "../components/CrearArticuloView";

const BaseConocimientoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Inicializar con el parámetro de URL si existe
    const tabFromUrl = searchParams.get("tab");
    return tabFromUrl && ["todos", "mis-articulos", "crear"].includes(tabFromUrl)
      ? tabFromUrl
      : "todos";
  });
  const crearArticuloRef = useRef<CrearArticuloViewRef>(null);

  // Sincronizar tab con URL cuando cambia externamente
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["todos", "mis-articulos", "crear"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = useCallback(
    async (tab: string) => {
      // Si estamos saliendo de la pestaña "crear" y hay contenido, guardar como borrador
      if (activeTab === "crear" && tab !== "crear") {
        if (crearArticuloRef.current?.tieneContenido()) {
          await crearArticuloRef.current.guardarBorrador();
        }
      }
      setActiveTab(tab);
      // Actualizar URL sin recargar
      if (tab === "todos") {
        setSearchParams({});
      } else {
        setSearchParams({ tab });
      }
    },
    [activeTab, setSearchParams]
  );

  const handleArticuloCreated = useCallback(() => {
    // Cambiar a la pestaña "Mis artículos" después de crear
    setActiveTab("mis-articulos");
    setSearchParams({ tab: "mis-articulos" });
  }, [setSearchParams]);

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
