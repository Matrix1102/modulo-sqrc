import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Calendar,
  User,
  Tag,
  Clock,
  Share2,
  Bookmark,
  Printer,
  History,
} from "lucide-react";
import { useArticulo } from "../hooks/useArticulos";
import { useBasePath } from "../hooks/useBasePath";
import articuloService from "../services/articuloService";
import { useUserId } from "../../../context";
import showToast from "../../../services/notification";
import type { ArticuloVersionResponse } from "../types/articulo";
import {
  VISIBILIDAD_LABELS,
  ETIQUETA_LABELS,
  TIPO_CASO_LABELS,
} from "../types/articulo";

const ArticuloExpandidoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buildPath } = useBasePath();
  const userId = useUserId();
  const articuloId = id ? parseInt(id, 10) : null;

  const { data: articulo, loading, refetch } = useArticulo(articuloId);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [versiones, setVersiones] = useState<ArticuloVersionResponse[]>([]);
  const [showVersiones, setShowVersiones] = useState(false);

  useEffect(() => {
    if (articuloId) {
      articuloService.obtenerVersiones(articuloId).then(setVersiones);
    }
  }, [articuloId]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    if (articulo) {
      navigate(buildPath(`/editar/${articulo.idArticulo}`));
    }
  }, [articulo, navigate, buildPath]);

  const handleFeedback = useCallback(
    async (util: boolean) => {
      if (!articulo || !articulo.versionVigente || feedbackGiven !== null)
        return;

      try {
        await articuloService.feedbackRapido(
          articulo.idArticulo,
          articulo.versionVigente,
          userId,
          util
        );
        setFeedbackGiven(util);
        showToast(
          util
            ? "¡Gracias por tu feedback positivo!"
            : "Gracias por tu feedback",
          "success"
        );
        refetch();
      } catch (error) {
        console.error("Error al enviar feedback:", error);
        showToast("Error al enviar feedback", "error");
      }
    },
    [articulo, userId, feedbackGiven, refetch]
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No especificado";
    try {
      return new Date(dateStr).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!articulo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Artículo no encontrado
          </h2>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVersiones(!showVersiones)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Historial de versiones"
            >
              <History size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Compartir"
            >
              <Share2 size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Guardar"
            >
              <Bookmark size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Imprimir"
              onClick={() => window.print()}
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={16} />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Code & Status */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              {articulo.codigo}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                articulo.estadoVersionVigente === "PUBLICADO"
                  ? "bg-green-100 text-green-700"
                  : articulo.estadoVersionVigente === "PROPUESTO"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {articulo.estadoVersionVigente || "Borrador"}
            </span>
            {articulo.estaVigente && (
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                Vigente
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {articulo.titulo}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <Tag size={14} />
              {ETIQUETA_LABELS[articulo.etiqueta]}
            </span>
            {articulo.tipoCaso && (
              <span className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg">
                {TIPO_CASO_LABELS[articulo.tipoCaso]}
              </span>
            )}
            <span className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
              {VISIBILIDAD_LABELS[articulo.visibilidad]}
            </span>
          </div>

          {/* Author & Dates */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>{articulo.nombrePropietario}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{formatDateShort(articulo.creadoEn)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>
                Actualizado{" "}
                {formatDateShort(articulo.actualizadoEn || articulo.creadoEn)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-gray-400" />
              <span>Versión {articulo.versionVigente || 1}</span>
            </div>
          </div>

          {/* Summary Box */}
          {articulo.resumen && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-2">
                Resumen
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {articulo.resumen}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            {articulo.contenidoVersionVigente ? (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: articulo.contenidoVersionVigente,
                }}
              />
            ) : (
              <p className="text-gray-500 italic text-center py-8">
                No hay contenido disponible para esta versión.
              </p>
            )}
          </div>

          {/* Vigencia Info */}
          {(articulo.vigenteDesde || articulo.vigenteHasta) && (
            <div className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Período de Vigencia
              </h3>
              <div className="flex items-center gap-6 text-sm text-amber-700">
                {articulo.vigenteDesde && (
                  <span>
                    <strong>Desde:</strong> {formatDate(articulo.vigenteDesde)}
                  </span>
                )}
                {articulo.vigenteHasta && (
                  <span>
                    <strong>Hasta:</strong> {formatDate(articulo.vigenteHasta)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center gap-6">
              <span className="text-gray-700 font-medium">
                ¿Te resultó útil este artículo?
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackGiven !== null}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    feedbackGiven === true
                      ? "bg-green-100 text-green-600 border border-green-200"
                      : "border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-600"
                  } ${
                    feedbackGiven !== null && feedbackGiven !== true
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <ThumbsUp size={18} />
                  <span>Sí, me ayudó</span>
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackGiven !== null}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    feedbackGiven === false
                      ? "bg-red-100 text-red-600 border border-red-200"
                      : "border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600"
                  } ${
                    feedbackGiven !== null && feedbackGiven !== false
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <ThumbsDown size={18} />
                  <span>No me ayudó</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-8 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <ThumbsUp size={14} className="text-green-500" />
                {articulo.feedbacksPositivos} personas encontraron útil este
                artículo
              </span>
              {articulo.calificacionPromedio > 0 && (
                <span className="flex items-center gap-1">
                  ⭐ {articulo.calificacionPromedio.toFixed(1)} calificación
                  promedio
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Versions */}
        {showVersiones && (
          <div className="w-72 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History size={18} />
                Historial de Versiones
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {versiones.map((v) => (
                  <div
                    key={v.idArticuloVersion}
                    className={`p-3 rounded-lg border transition-colors ${
                      v.esVigente
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        v{v.numeroVersion}
                      </span>
                      {v.esVigente && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {formatDateShort(v.creadoEn)}
                    </p>
                    {v.notaCambio && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {v.notaCambio}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Por {v.nombreCreador}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticuloExpandidoPage;
