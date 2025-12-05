/**
 * Filtros para la tabla de tickets
 */
import { useState } from 'react';
import type { TipoTicket, EstadoTicket, TicketFilter } from '../types';

interface TicketFiltersProps {
  filters?: TicketFilter;
  onFiltersChange: (filters: TicketFilter) => void;
}

export const TicketFilters = ({ onFiltersChange }: TicketFiltersProps) => {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoTicket | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoTicket | ''>('');
  const [fecha, setFecha] = useState('');

  const buildFilters = (
    tipo: TipoTicket | '',
    estado: EstadoTicket | '',
    fechaValue: string,
    searchValue: string
  ): TicketFilter => {
    const newFilters: TicketFilter = {};
    if (tipo) newFilters.tipo = tipo;
    if (estado) newFilters.estado = estado;
    if (fechaValue) newFilters.fecha = fechaValue;
    if (searchValue) newFilters.search = searchValue;
    return newFilters;
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange(buildFilters(tipoFilter, estadoFilter, fecha, value));
  };

  const handleTipoChange = (value: TipoTicket | '') => {
    setTipoFilter(value);
    onFiltersChange(buildFilters(value, estadoFilter, fecha, search));
  };

  const handleEstadoChange = (value: EstadoTicket | '') => {
    setEstadoFilter(value);
    onFiltersChange(buildFilters(tipoFilter, value, fecha, search));
  };

  const handleFechaChange = (value: string) => {
    setFecha(value);
    onFiltersChange(buildFilters(tipoFilter, estadoFilter, value, search));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Buscador */}
      <div className="flex-1 min-w-[250px]">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar tickets, clientes..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filtro Tipo */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Tipo</span>
        <select
          value={tipoFilter}
          onChange={(e) => handleTipoChange(e.target.value as TipoTicket | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="CONSULTA">Consulta</option>
          <option value="QUEJA">Queja</option>
          <option value="RECLAMO">Reclamo</option>
          <option value="SOLICITUD">Solicitud</option>
        </select>
      </div>

      {/* Filtro Estado */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Estado</span>
        <select
          value={estadoFilter}
          onChange={(e) => handleEstadoChange(e.target.value as EstadoTicket | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="ABIERTO">Abierto</option>
          <option value="ESCALADO">Escalado</option>
          <option value="DERIVADO">Derivado</option>
          <option value="CERRADO">Cerrado</option>
        </select>
      </div>

      {/* Filtro Fecha - Una sola fecha específica */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Fecha Creación</span>
        <input
          type="date"
          value={fecha}
          onChange={(e) => handleFechaChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};
