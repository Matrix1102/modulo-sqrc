import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const [ticket] = useState({
    id: ticketId || "100236",
    cliente: "Maria García",
    asignado: "Andre Altamirano",
    estado: "ABIERTO",
    tipo: "Solicitud",
    fecha: "26/10/2025",
    motivo: "Router descompuesto",
    canal: "Presencial",
  });

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Ticket - {ticket.id}
          </h1>
          <p className="text-gray-500">Información detallada del ticket</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-800 underline text-sm font-medium transition-colors"
        >
          Volver
        </button>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA (Datos Fijos) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-100/50 p-6 rounded-xl border border-gray-200 space-y-4">
            {/* Campos de Solo Lectura */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Nombre del cliente
              </label>
              <input
                type="text"
                value={ticket.cliente}
                readOnly
                className="w-full p-2 bg-white rounded border border-gray-300 text-sm font-medium text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Asignado a
              </label>
              <select className="w-full p-2 bg-white rounded border border-gray-300 text-sm text-gray-700 outline-none focus:border-blue-500">
                <option>{ticket.asignado}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Estado
              </label>
              <div className="flex">
                <Badge variant="success">{ticket.estado}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tipo
                </label>
                <p className="text-sm font-medium text-gray-800">
                  {ticket.tipo}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Fecha
                </label>
                <p className="text-sm font-medium text-gray-800">
                  {ticket.fecha}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Motivo
              </label>
              <p className="text-sm font-medium text-gray-800">
                {ticket.motivo}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Canal
              </label>
              <p className="text-sm font-medium text-gray-800">
                {ticket.canal}
              </p>
            </div>

            <button className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-400 transition-colors mt-4">
              Generar Articulación
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA (Área de Trabajo) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buscador KB */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Artículo de la Base de Conocimiento
            </label>
            <input
              type="text"
              placeholder="Buscar solución..."
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Áreas de Texto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-72 flex flex-col">
              <label className="font-bold text-gray-700 mb-2 text-sm">
                Problemática:
              </label>
              <textarea
                className="flex-1 w-full bg-gray-50 border-none rounded-lg resize-none p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Descripción detallada..."
              />
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-72 flex flex-col">
              <label className="font-bold text-gray-700 mb-2 text-sm">
                Solución:
              </label>
              <textarea
                className="flex-1 w-full bg-gray-50 border-none rounded-lg resize-none p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Pasos realizados..."
              />
            </div>
          </div>

          {/* Historial / Footer */}
          <div className="bg-gray-100/50 p-4 rounded-xl border-l-4 border-green-500 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Historial
              </p>
              <p className="text-sm font-medium text-gray-800">
                SE CREÓ EL TICKET - {ticket.fecha}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
