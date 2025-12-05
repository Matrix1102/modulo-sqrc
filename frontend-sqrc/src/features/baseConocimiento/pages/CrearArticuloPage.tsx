import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ArticuloForm } from "../components/ArticuloForm";
import { useBasePath } from "../hooks/useBasePath";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import type { CrearArticuloRequest } from "../types/articulo";

export const CrearArticuloPage: React.FC = () => {
  const navigate = useNavigate();
  const { buildPath } = useBasePath();
  const userId = useUserId();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: CrearArticuloRequest, publicar: boolean) => {
      setLoading(true);
      try {
        // Asegurar que idPropietario viene del usuario actual
        const dataConUsuario = { ...data, idPropietario: userId };

        // Crear el artículo
        const nuevoArticulo = await articuloService.crearArticulo(
          dataConUsuario
        );

        if (publicar && nuevoArticulo.totalVersiones > 0) {
          // Si quiere publicar, publicamos directamente
          // Primero obtenemos la versión vigente
          const versionVigente = await articuloService.obtenerVersionVigente(
            nuevoArticulo.idArticulo
          );
          await articuloService.publicarArticulo(
            nuevoArticulo.idArticulo,
            versionVigente.idArticuloVersion,
            {
              visibilidad: data.visibilidad,
              vigenteDesde: data.vigenteDesde,
              vigenteHasta: data.vigenteHasta,
            }
          );
          showToast("Artículo creado y publicado correctamente", "success");
        } else {
          showToast("Artículo guardado como borrador", "success");
        }

        // Navegar a la página de detalle o a la lista
        navigate(buildPath(""));
      } catch (error) {
        console.error("Error al crear artículo:", error);
        showToast("Error al crear el artículo", "error");
      } finally {
        setLoading(false);
      }
    },
    [navigate, buildPath, userId]
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <ArticuloForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CrearArticuloPage;
