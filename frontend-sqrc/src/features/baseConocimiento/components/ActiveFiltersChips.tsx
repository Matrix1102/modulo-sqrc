import React from "react";
import { X } from "lucide-react";
import type { BusquedaArticuloRequest } from "../types/articulo";
import {
  ETIQUETA_LABELS,
  VISIBILIDAD_LABELS,
  TIPO_CASO_LABELS,
} from "../types/articulo";

interface ActiveFiltersChipsProps {
  filtros: BusquedaArticuloRequest;
  onRemoveFilter: (key: keyof BusquedaArticuloRequest) => void;
}

interface FilterChip {
  key: keyof BusquedaArticuloRequest;
  label: string;
  value: string;
  color: string;
}

export const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({
  filtros,
  onRemoveFilter,
}) => {
  // Construir array de chips activos
  const chips: FilterChip[] = [];

  if (filtros.texto) {
    chips.push({
      key: "texto",
      label: "Búsqueda",
      value: `"${filtros.texto}"`,
      color: "bg-blue-100 text-blue-700",
    });
  }

  if (filtros.etiqueta) {
    chips.push({
      key: "etiqueta",
      label: "Categoría",
      value: ETIQUETA_LABELS[filtros.etiqueta],
      color: "bg-purple-100 text-purple-700",
    });
  }

  if (filtros.tipoCaso) {
    chips.push({
      key: "tipoCaso",
      label: "Tipo",
      value: TIPO_CASO_LABELS[filtros.tipoCaso],
      color: "bg-orange-100 text-orange-700",
    });
  }

  if (filtros.visibilidad) {
    chips.push({
      key: "visibilidad",
      label: "Visibilidad",
      value: VISIBILIDAD_LABELS[filtros.visibilidad],
      color: "bg-green-100 text-green-700",
    });
  }

  if (filtros.soloVigentes) {
    chips.push({
      key: "soloVigentes",
      label: "",
      value: "Solo vigentes",
      color: "bg-teal-100 text-teal-700",
    });
  }

  if (filtros.soloPublicados === false) {
    chips.push({
      key: "soloPublicados",
      label: "",
      value: "Incluir no publicados",
      color: "bg-yellow-100 text-yellow-700",
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${chip.color}`}
        >
          {chip.label && <span className="opacity-70">{chip.label}:</span>}
          <span>{chip.value}</span>
          <button
            onClick={() => onRemoveFilter(chip.key)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label={`Eliminar filtro ${chip.label || chip.value}`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFiltersChips;
