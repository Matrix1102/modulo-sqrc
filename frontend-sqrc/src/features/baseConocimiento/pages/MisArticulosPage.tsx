import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Send,
  Edit,
  Archive,
  TrendingUp,
  Search,
} from "lucide-react";
import { useMisArticulos } from "../hooks/useArticulos";
import { ArticuloColumn } from "../components/ArticuloColumnCard";
import { useUserId } from "../../../context";
import type {
  ArticuloResumen,
  ArticuloResumenResponse,
} from "../types/articulo";
import { mapToArticuloResumen } from "../types/articulo";

export const MisArticulosPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener el ID del usuario actual desde el contexto de autenticación
  const idPropietario = useUserId();

  const {
    articulos: misArticulos,
    borradores,
    deprecados: articulosDeprecados,
    populares: articulosPopulares,
    loading,
    error,
    refetch,
  } = useMisArticulos(idPropietario);

  // Convertir a ArticuloResumen y agregar estado propuesto (simulado por ahora)
  const toResumen = useCallback(
    (
      items: ArticuloResumenResponse[],
      estadoDefault: string = "PUBLICADO"
    ): ArticuloResumen[] => {
      return items.map((a) => ({
        ...mapToArticuloResumen(a),
        estado: (a.estado || estadoDefault) as ArticuloResumen["estado"],
      }));
    },
    []
  );

  // Filtrar por búsqueda
  const filterBySearch = useCallback(
    (items: ArticuloResumen[]): ArticuloResumen[] => {
      if (!searchTerm.trim()) return items;
      const term = searchTerm.toLowerCase();
      return items.filter(
        (a) =>
          a.titulo.toLowerCase().includes(term) ||
          a.codigo.toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );

  // Propuestos (filtramos de misArticulos los que tengan estado PROPUESTO)
  const propuestos = useMemo(
    () =>
      filterBySearch(
        toResumen(
          misArticulos.filter((a) => a.estado === "PROPUESTO"),
          "PROPUESTO"
        )
      ),
    [misArticulos, toResumen, filterBySearch]
  );

  // Borradores
  const borradoresResumen = useMemo(
    () => filterBySearch(toResumen(borradores, "BORRADOR")),
    [borradores, toResumen, filterBySearch]
  );

  // Deprecados
  const deprecadosResumen = useMemo(
    () => filterBySearch(toResumen(articulosDeprecados, "DEPRECADO")),
    [articulosDeprecados, toResumen, filterBySearch]
  );

  // Populares
  const popularesResumen = useMemo(
    () => filterBySearch(toResumen(articulosPopulares, "PUBLICADO")),
    [articulosPopulares, toResumen, filterBySearch]
  );

  const handleNuevoArticulo = useCallback(() => {
    navigate("/base-conocimiento/crear");
  }, [navigate]);

  const handleArticuloClick = useCallback(
    (articulo: ArticuloResumen) => {
      navigate(`/base-conocimiento/${articulo.id}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary-600" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Mis Artículos
                </h1>
                <p className="text-sm text-gray-500">
                  Gestiona tus artículos de la base de conocimiento
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar mis artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 w-64 transition-all"
                />
              </div>

              <button
                onClick={handleNuevoArticulo}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Nuevo Artículo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: 4 columns Kanban */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">Error al cargar los artículos</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {/* Propuestos */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <ArticuloColumn
                titulo="Propuestos"
                icono={<Send size={18} />}
                color="#F59E0B"
                articulos={propuestos}
                loading={loading}
                emptyMessage="No tienes artículos propuestos"
                onArticuloClick={handleArticuloClick}
              />
            </div>

            {/* Borradores */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <ArticuloColumn
                titulo="Borradores"
                icono={<Edit size={18} />}
                color="#3B82F6"
                articulos={borradoresResumen}
                loading={loading}
                emptyMessage="No tienes borradores"
                onArticuloClick={handleArticuloClick}
              />
            </div>

            {/* Deprecados */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <ArticuloColumn
                titulo="Deprecados"
                icono={<Archive size={18} />}
                color="#6B7280"
                articulos={deprecadosResumen}
                loading={loading}
                emptyMessage="No tienes artículos deprecados"
                onArticuloClick={handleArticuloClick}
              />
            </div>

            {/* Populares */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <ArticuloColumn
                titulo="Populares"
                icono={<TrendingUp size={18} />}
                color="#10B981"
                articulos={popularesResumen}
                loading={loading}
                emptyMessage="Sin artículos populares"
                onArticuloClick={handleArticuloClick}
                showStats
              />
            </div>
          </div>
        )}

        {/* Stats summary */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Send size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {propuestos.length}
              </p>
              <p className="text-sm text-gray-500">Propuestos</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {borradoresResumen.length}
              </p>
              <p className="text-sm text-gray-500">Borradores</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Archive size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {deprecadosResumen.length}
              </p>
              <p className="text-sm text-gray-500">Deprecados</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {misArticulos.length}
              </p>
              <p className="text-sm text-gray-500">Total artículos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisArticulosPage;
