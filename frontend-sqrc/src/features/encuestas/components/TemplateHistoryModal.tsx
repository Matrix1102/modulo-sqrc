import React, { useState } from "react";
import { X, Search, FileClock, Eye, RotateCcw } from "lucide-react";
import { Badge } from "../../../components/ui/Badge"; // Reutilizamos tu Badge existente

interface HistoryItem {
  id: number;
  nombre: string;
  tipo: "AGENTE" | "SERVICIO";
  version: string;
  fechaCreacion: string;
  estado: "ACTIVA" | "INACTIVA";
  autor: string;
}

interface TemplateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateHistoryModal: React.FC<TemplateHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // --- MOCK DATA ---
  const historyData: HistoryItem[] = [
    {
      id: 1,
      nombre: "Encuesta Satisfacción Agente",
      tipo: "AGENTE",
      version: "v3.0",
      fechaCreacion: "20/10/2025",
      estado: "ACTIVA",
      autor: "Juan Pérez",
    },
    {
      id: 2,
      nombre: "Encuesta Calidad Servicio",
      tipo: "SERVICIO",
      version: "v2.1",
      fechaCreacion: "15/10/2025",
      estado: "ACTIVA",
      autor: "Maria Lopez",
    },
    {
      id: 3,
      nombre: "Encuesta Agente (Versión Corta)",
      tipo: "AGENTE",
      version: "v2.0",
      fechaCreacion: "01/05/2025",
      estado: "INACTIVA",
      autor: "Juan Pérez",
    },
    {
      id: 4,
      nombre: "Encuesta Navidad 2024",
      tipo: "SERVICIO",
      version: "v1.0",
      fechaCreacion: "01/12/2024",
      estado: "INACTIVA",
      autor: "Admin",
    },
  ];

  const filteredData = historyData.filter((item) =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    /* --- 1. OVERLAY --- */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* --- 2. CONTENEDOR DEL MODAL --- */}
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER FIJO --- */}
        <div className="p-6 border-b border-gray-100 bg-white z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <FileClock className="text-blue-600" /> Historial de Versiones
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta y restaura versiones anteriores de tus encuestas.
            </p>
          </div>

          {/* Buscador y Cerrar */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* --- CUERPO SCROLLEABLE (TABLA) --- */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Nombre / Versión</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Creado el</th>
                  <th className="p-4">Autor</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-800">
                        {item.nombre}
                      </div>
                      <span className="text-xs text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block border border-blue-100">
                        {item.version}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{item.fechaCreacion}</td>
                    <td className="p-4 text-gray-500">{item.autor}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          item.estado === "ACTIVA" ? "success" : "neutral"
                        }
                      >
                        {item.estado}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          title="Ver diseño"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        >
                          <Eye size={18} />
                        </button>

                        {item.estado === "INACTIVA" && (
                          <button
                            title="Restaurar esta versión"
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                            onClick={() => {
                              if (
                                confirm(
                                  `¿Deseas restaurar la versión ${item.version}?`
                                )
                              ) {
                                console.log("Restaurando...", item.id);
                              }
                            }}
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No se encontraron plantillas que coincidan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FOOTER FIJO --- */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition border border-transparent hover:border-gray-300"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
