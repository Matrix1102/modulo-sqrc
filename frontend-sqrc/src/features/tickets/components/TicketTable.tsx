// src/features/tickets/components/TicketTable.tsx
import { Search, Filter, Plus } from "lucide-react";
// 1. Importamos el Badge genérico (ajusta la ruta según tus carpetas)
import { Badge } from "../../../components/ui/Badge";

const tickets = Array(7).fill({
  id: "SQR-100236",
  client: "Andre Melendez",
  motive: "Cobro doble",
  date: "31/10/2025",
  status: "ABIERTO",
});

// 2. Definimos la lógica de negocio aquí (Mapeo Estado -> Color)
const getStatusVariant = (status: string) => {
  switch (status) {
    case "ABIERTO":
      return "success"; // Verde
    case "PENDIENTE":
      return "warning"; // Amarillo
    case "CERRADO":
      return "neutral"; // Gris
    case "URGENTE":
      return "danger"; // Rojo
    default:
      return "blue";
  }
};

export const TicketTable = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">
          Tickets con interacción reciente
        </h3>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar tickets..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          <Filter size={16} />
          Todos
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
          <Plus size={16} />
          Ticket
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-100">
              <th className="py-3 font-medium">Ticket</th>
              <th className="py-3 font-medium">Cliente</th>
              <th className="py-3 font-medium">Motivo</th>
              <th className="py-3 font-medium">Fecha</th>
              <th className="py-3 font-medium text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group cursor-pointer"
              >
                <td className="py-4">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                    {t.id}
                  </span>
                </td>
                <td className="py-4 text-sm font-medium text-gray-700">
                  {t.client}
                </td>
                <td className="py-4 text-sm text-gray-500">{t.motive}</td>
                <td className="py-4 text-sm text-gray-500">{t.date}</td>

                {/* 3. Usamos el Badge Genérico inyectando la variante */}
                <td className="py-4 text-right">
                  <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
