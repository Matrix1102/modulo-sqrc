import React from "react";
import { Database } from "lucide-react";
import type { ArticuloResumenResponse } from "../types/articulo";
import ArticuloCard from "./ArticuloCard";

interface ArticuloListProps {
  articulos: ArticuloResumenResponse[];
  onSelect?: (articulo: ArticuloResumenResponse) => void;
  loading?: boolean;
  emptyMessage?: string;
  variant?: "grid" | "list";
  cardVariant?: "default" | "compact";
}

export const ArticuloList: React.FC<ArticuloListProps> = ({
  articulos,
  onSelect,
  loading = false,
  emptyMessage = "No hay artículos disponibles",
  variant = "list",
  cardVariant = "default",
}) => {
  // Skeleton loading
  if (loading) {
    return (
      <div
        className={
          variant === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
        }
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="animate-pulse bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-full mb-1" />
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!articulos || articulos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Database size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Grid or list layout
  const containerClass =
    variant === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : "space-y-3";

  return (
    <div className={containerClass}>
      {articulos.map((articulo) => (
        <ArticuloCard
          key={articulo.idArticulo}
          articulo={articulo}
          onClick={onSelect}
          variant={cardVariant}
        />
      ))}
    </div>
  );
};

export default ArticuloList;
