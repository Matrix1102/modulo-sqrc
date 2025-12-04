import React from "react";
import { Calendar, Search, SlidersHorizontal } from "lucide-react";

export type ProductStatusFilter = "todos" | "pagado" | "pago parcial" | "pendiente";

export interface ProductFilterState {
  search: string;
  status: ProductStatusFilter;
  dateFrom: string;
  dateTo: string;
}

interface ProductFilterBarProps {
  filters: ProductFilterState;
  onFiltersChange: (partial: Partial<ProductFilterState>) => void;
}

const statusOptions: Array<{ label: string; value: ProductStatusFilter }> = [
  { label: "Todos", value: "todos" },
  { label: "Pagado", value: "pagado" },
  { label: "Pago parcial", value: "pago parcial" },
  { label: "Pendiente", value: "pendiente" },
];

const ProductFilterBar: React.FC<ProductFilterBarProps> = ({ filters, onFiltersChange }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
      <label className="flex-1 text-sm font-medium text-gray-700">
        <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Search size={14} />
          Buscar producto
        </span>
        <input
          type="text"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
          placeholder="Nombre o código del producto"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
        />
      </label>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Calendar size={14} />
            Fecha inicio
          </span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onFiltersChange({ dateFrom: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Calendar size={14} />
            Fecha fin
          </span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => onFiltersChange({ dateTo: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </label>
      </div>

      <label className="lg:w-56 text-sm font-medium text-gray-700">
        <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <SlidersHorizontal size={14} />
          Estado
        </span>
        <select
          value={filters.status}
          onChange={(event) => onFiltersChange({ status: event.target.value as ProductStatusFilter })}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default ProductFilterBar;
