/**
 * Tabla de listado de tickets
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { EstadoBadge } from './EstadoBadge';
import { TipoBadge } from './TipoBadge';
import type { TicketListItem } from '../types';

interface TicketListTableProps {
  tickets: TicketListItem[];
  loading?: boolean;
  selectedTickets?: number[];
  onSelectTicket?: (id: number) => void;
  onSelectAll?: () => void;
}

export const TicketListTable = ({
  tickets,
  loading = false,
  selectedTickets = [],
  onSelectTicket,
  onSelectAll,
}: TicketListTableProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar la ruta base actual (ej: /agente-llamada, /agente-presencial, /backoffice)
  const getBasePath = () => {
    const path = location.pathname;
    if (path.startsWith('/agente-llamada')) return '/agente-llamada';
    if (path.startsWith('/agente-presencial')) return '/agente-presencial';
    if (path.startsWith('/backoffice')) return '/backoffice';
    if (path.startsWith('/supervisor')) return '/supervisor';
    return '/agente-llamada'; // fallback
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTicketId = (id: number) => {
    return `#TC-${id.toString().padStart(4, '0')}`;
  };

  const handleRowClick = (ticketId: number) => {
    const basePath = getBasePath();
    navigate(`${basePath}/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando tickets...</span>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tickets</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron tickets con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                onChange={onSelectAll}
                checked={selectedTickets.length === tickets.length && tickets.length > 0}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asunto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Creación
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr
              key={ticket.idTicket}
              onClick={() => handleRowClick(ticket.idTicket)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedTickets.includes(ticket.idTicket)}
                  onChange={() => onSelectTicket?.(ticket.idTicket)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatTicketId(ticket.idTicket)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                {ticket.asunto}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <EstadoBadge estado={ticket.estado} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                {ticket.cliente?.nombre ?? ''} {ticket.cliente?.apellido ?? ''}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <TipoBadge tipo={ticket.tipoTicket} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(ticket.fechaCreacion)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
