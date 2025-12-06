import React, { useMemo, useState } from "react";
import { Filter, Plus, FileQuestion } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import SearchBar from "../../../components/ui/SearchBar";

interface TicketTableProps {
  tickets: any[];
  title?: string;
  showToolbar?: boolean;
  loading?: boolean;
  emptyVariant?: "simple" | "rich";
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
  loading = false,
  emptyVariant = "simple",
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  const STATUS_OPTIONS = ["TODOS", "ABIERTO", "ESCALADO", "DERIVADO", "CERRADO"];

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();

    return tickets.filter((t) => {
      const matchesQuery =
        q === "" ||
        String(t.id || "").toLowerCase().includes(q) ||
        String(t.client || "").toLowerCase().includes(q) ||
        String(t.motive || "").toLowerCase().includes(q) ||
        String(t.status || "").toLowerCase().includes(q) ||
        String(t.date || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "TODOS" || (t.status || "") === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [tickets, query, statusFilter]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col transition-all overflow-hidden">
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
            {/* Reusable SearchBar */}
            <SearchBar
              value={query}
              onChange={(q) => setQuery(q)}
              placeholder="Buscar tickets..."
            />
          </div>

          {/* Status filter select (replace 'Todos' button) */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="text-sm">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus size={16} />
            Ticket
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {loading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                  <div>
                    <div className="h-4 bg-gray-100 rounded w-36 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          emptyVariant === "simple" ? (
            <div className="flex-1 flex items-center justify-center text-center min-h-[200px] text-gray-500 m-2">
              No hay tickets disponibles
            </div>
          ) : (
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
          )
        ) : (
          /* --- TABLA DE DATOS --- */
          <div className="overflow-auto flex-1">
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
                {filtered.map((t, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/40 transition-colors group"
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
