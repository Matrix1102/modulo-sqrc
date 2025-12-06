import React, { useEffect, useState } from 'react';
import { respuestaService } from '../services/respuestaService';
import type { RespuestaHistorialDTO } from '../type';

const HistorialRespuestasPage: React.FC = () => {
    const [respuestas, setRespuestas] = useState<RespuestaHistorialDTO[]>([]);
    const [filtro, setFiltro] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarHistorial();
    }, []);

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            const data = await respuestaService.obtenerHistorial();
            setRespuestas(data);
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtrado en el cliente (rápida y efectiva)
    const respuestasFiltradas = respuestas.filter(r => 
        r.nombreCliente.toLowerCase().includes(filtro.toLowerCase()) ||
        r.dniCliente.includes(filtro) ||
        r.asunto.toLowerCase().includes(filtro.toLowerCase())
    );

    // Formateador de fecha
    const formatearFecha = (fechaIso: string) => {
        if (!fechaIso) return '-';
        return new Date(fechaIso).toLocaleString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            
            {/* CABECERA */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Historial de Respuestas</h1>
                    <p className="text-gray-500 text-sm">Registro de PDFs enviados manual y automáticamente</p>
                </div>
                
                {/* BUSCADOR */}
                <div className="w-full md:w-1/3">
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, DNI o asunto..." 
                        className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Fecha Envío</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Asunto</th>
                                <th className="px-6 py-4 text-center">PDF</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Cargando historial...
                                    </td>
                                </tr>
                            ) : respuestasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : (
                                respuestasFiltradas.map((item) => (
                                    <tr key={item.idRespuesta} className="hover:bg-blue-50 transition-colors duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            #{item.idRespuesta}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {formatearFecha(item.fechaEnvio)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-800">{item.nombreCliente}</span>
                                                <span className="text-xs text-gray-500">DNI: {item.dniCliente}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.tipoRespuesta === 'AUTOMATICA' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {item.tipoRespuesta}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.asunto}>
                                            {item.asunto}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.urlPdf ? (
                                                <a 
                                                    href={item.urlPdf} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                                                    title="Ver PDF"
                                                >
                                                    {/* Ícono PDF (SVG) */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Paginación simple o Footer de tabla */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Mostrando {respuestasFiltradas.length} registros
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HistorialRespuestasPage;