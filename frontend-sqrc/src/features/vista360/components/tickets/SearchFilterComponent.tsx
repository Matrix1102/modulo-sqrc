import React, { useCallback, useEffect, useState } from "react";
import type { DateRange, FilterCriteria, TicketStatus } from "./types";
import {
  CHANNEL_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  createDefaultFilters,
} from "./helpers";

export interface SearchFilterComponentProps {
  onSearch: (filters: FilterCriteria) => void;
  initialFilters?: FilterCriteria;
}

const formatDateInput = (value: Date | null) =>
  value ? value.toISOString().split("T")[0] : "";

const SearchFilterComponent: React.FC<SearchFilterComponentProps> = ({
  onSearch,
  initialFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterCriteria>(
    () => initialFilters ?? createDefaultFilters(),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialFilters) {
      setDraftFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleToggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraftFilters((prev) => ({ ...prev, term: event.target.value }));
  };

  const handleDateChange = (key: keyof DateRange) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    const nextDate = value ? new Date(`${value}T00:00:00`) : null;

    setDraftFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: nextDate && !Number.isNaN(nextDate.getTime()) ? nextDate : null,
      },
    }));
  };

  const handleStatusToggle = (status: TicketStatus) => {
    setDraftFilters((prev) => {
      const exists = prev.status.includes(status);
      const statusList = exists
        ? prev.status.filter((item) => item !== status)
        : [...prev.status, status];

      return { ...prev, status: statusList };
    });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as FilterCriteria["type"] | "";
    setDraftFilters((prev) => ({ ...prev, type: value === "" ? null : value }));
  };

  const handleChannelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as FilterCriteria["channel"] | "";
    setDraftFilters((prev) => ({ ...prev, channel: value === "" ? null : value }));
  };

  const handleReset = useCallback(() => {
    setDraftFilters(createDefaultFilters());
  }, []);

  const handleSubmit = useCallback(() => {
    const payload: FilterCriteria = {
      ...draftFilters,
      status: [...draftFilters.status],
      dateRange: { ...draftFilters.dateRange },
    };

    onSearch(payload);
    setIsModalOpen(false);
  }, [draftFilters, onSearch]);

  return (
    <section className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Buscar tickets</h3>
          <p className="text-xs text-gray-500">
            Aplica filtros avanzados para encontrar incidencias del cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleModal}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
        >
          Filtros
        </button>
      </div>

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={handleToggleModal}
            aria-hidden
          />

          <div className="fixed inset-x-0 top-24 z-50 mx-auto w-full max-w-2xl px-4">
            <div
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Configurar filtros</h4>
                  <p className="text-xs text-gray-500">
                    Ajusta los criterios y presiona aplicar para refrescar los resultados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleModal}
                  className="text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600"
                  aria-label="Cerrar filtros"
                >
                  Cerrar
                </button>
              </header>

              <div className="space-y-5">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                    Término de búsqueda
                  </span>
                  <input
                    type="text"
                    value={draftFilters.term}
                    onChange={handleTermChange}
                    placeholder="Código, motivo o detalle del ticket"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Fecha desde</span>
                    <input
                      type="date"
                      value={formatDateInput(draftFilters.dateRange.start)}
                      onChange={handleDateChange("start")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Fecha hasta</span>
                    <input
                      type="date"
                      value={formatDateInput(draftFilters.dateRange.end)}
                      onChange={handleDateChange("end")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => {
                      const isActive = draftFilters.status.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusToggle(status)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            isActive
                              ? "border-blue-500 bg-blue-100 text-blue-700"
                              : "border-gray-200 bg-gray-100 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Tipo</span>
                    <select
                      value={draftFilters.type ?? ""}
                      onChange={handleTypeChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Canal</span>
                    <select
                      value={draftFilters.channel ?? ""}
                      onChange={handleChannelChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      {CHANNEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <footer className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Reiniciar
                </button>
                <button
                  type="button"
                  onClick={handleToggleModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-blue-700"
                >
                  Aplicar filtros
                </button>
              </footer>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default SearchFilterComponent;
