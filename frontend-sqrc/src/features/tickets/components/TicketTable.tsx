import React from "react";
import { Search, Filter, Plus, FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";

interface TicketTableProps {
  tickets: any[];
  title?: string;
  showToolbar?: boolean;
  onRowClick?: (id: string) => void;
}

// Lógica de colores para los estados
const getStatusVariant = (status: string) => {
  switch (status) {
    case "ABIERTO":
      return "success";
    case "PENDIENTE":
      return "warning";
    case "CERRADO":
      return "neutral";
    case "URGENTE":
      return "danger";
    default:
      return "blue";
  }
};

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets = [],
  title,
  showToolbar = true,
  onRowClick,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    if (onRowClick) onRowClick(id);
    else navigate(`/supervisor/ticketing/detalle/${id}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col transition-all">
      {/* Título */}
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar tickets..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
            <Filter size={16} />
            Todos
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus size={16} />
            Ticket
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 relative flex flex-col">
        {tickets.length === 0 ? (
          /* --- EMPTY STATE MEJORADO --- */
          <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[300px] border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30 m-2">
            {/* Icono con efecto de anillo */}
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-white p-5 rounded-full shadow-sm ring-8 ring-blue-50">
                <FileQuestion
                  size={40}
                  className="text-blue-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Textos */}
            <h4 className="text-gray-900 font-bold text-lg mb-2">
              No hay tickets disponibles
            </h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Actualmente no hay tickets que coincidan con tu búsqueda o la
              lista está vacía.
            </p>

            {/* Botón de acción secundaria */}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Actualizar lista
            </button>
          </div>
        ) : (
          /* --- TABLA DE DATOS --- */
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 pl-2 font-semibold">Ticket</th>
                  <th className="py-3 font-semibold">Cliente</th>
                  <th className="py-3 font-semibold">Motivo</th>
                  <th className="py-3 font-semibold">Fecha</th>
                  <th className="py-3 pr-2 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((t, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleRowClick(t.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-2">
                      <span className="bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 px-2 py-1 rounded text-xs font-bold transition-colors">
                        #{t.id}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-semibold text-gray-700">
                      {t.client}
                    </td>
                    <td className="py-4 text-sm text-gray-500">{t.motive}</td>
                    <td className="py-4 text-sm text-gray-400">{t.date}</td>
                    <td className="py-4 pr-2 text-right">
                      <Badge variant={getStatusVariant(t.status)}>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
