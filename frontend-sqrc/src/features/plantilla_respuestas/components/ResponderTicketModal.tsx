import { useState, useEffect } from 'react';
// IMPORTANTE: Importamos cada servicio de su propio archivo
import { plantillaService } from '../services/plantillaService';
import { respuestaService } from '../services/respuestaService'; 
import type { PlantillaResumen } from '../type';
import { FaPaperPlane, FaTimes, FaSync, FaEye } from 'react-icons/fa';

interface TicketData {
    id: number;
    tipo: string; // Usamos string para evitar conflictos de enum
    clienteCorreo: string;
}

interface Props {
    ticket: TicketData;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ResponderTicketModal = ({ ticket, isOpen, onClose, onSuccess }: Props) => {
    
    // Estados
    const [plantillas, setPlantillas] = useState<PlantillaResumen[]>([]);
    const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | ''>('');
    
    const [asunto, setAsunto] = useState('');
    const [cuerpo, setCuerpo] = useState(''); 
    const [htmlPreview, setHtmlPreview] = useState('');
    
    const [cerrarTicket, setCerrarTicket] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // 1. Cargar plantillas al abrir
    useEffect(() => {
        if (isOpen && ticket.tipo) {
            // Usamos plantillaService para listar
            plantillaService.getByCaso(ticket.tipo).then(setPlantillas);
        }
    }, [isOpen, ticket.tipo]);

    // 2. Al seleccionar plantilla -> Cargar Borrador
    const handleSelectPlantilla = async (id: number) => {
        setSelectedPlantillaId(id);
        if (!id) return;

        setLoadingPreview(true);
        try {
            // Usamos respuestaService para obtener el borrador
            const borrador = await respuestaService.obtenerBorrador(ticket.id, id);
            
            setAsunto(borrador.titulo);
            setCuerpo(borrador.cuerpo);
            setHtmlPreview(borrador.htmlPreview); 
        } catch (error) {
            console.error(error);
            alert("Error cargando la plantilla.");
        } finally {
            setLoadingPreview(false);
        }
    };

    // 3. Actualizar Vista Previa
    const handleUpdatePreview = async () => {
        if (!selectedPlantillaId) return;
        setLoadingPreview(true);
        try {
            const res = await respuestaService.simular({
                idAsignacion: ticket.id,
                idPlantilla: Number(selectedPlantillaId),
                correoDestino: ticket.clienteCorreo,
                asunto: asunto,
                cerrarTicket: false,
                variables: { cuerpo: cuerpo }
            });
            setHtmlPreview(res.htmlRenderizado);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPreview(false);
        }
    };

    // 4. Enviar
    const handleEnviar = async () => {
        if (!confirm("¿Enviar respuesta al cliente?")) return;
        
        setLoading(true);
        try {
            await respuestaService.enviar({
                idAsignacion: ticket.id,
                idPlantilla: Number(selectedPlantillaId),
                correoDestino: ticket.clienteCorreo,
                asunto: asunto,
                cerrarTicket: cerrarTicket,
                variables: { cuerpo: cuerpo }
            });
            
            alert("Respuesta enviada correctamente.");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Error al enviar.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FaPaperPlane /> Responder Ticket #{ticket.id}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    
                    {/* IZQUIERDA: FORMULARIO */}
                    <div className="w-1/3 bg-gray-50 p-6 border-r overflow-y-auto flex flex-col gap-4">
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plantilla ({ticket.tipo})</label>
                            <select 
                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                value={selectedPlantillaId}
                                onChange={(e) => handleSelectPlantilla(Number(e.target.value))}
                            >
                                <option value="">-- Seleccione --</option>
                                {plantillas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {selectedPlantillaId !== '' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asunto</label>
                                    <input 
                                        type="text" className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={asunto} onChange={(e) => setAsunto(e.target.value)}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mensaje</label>
                                    <textarea 
                                        className="w-full border border-gray-300 rounded p-3 text-sm flex-1 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={10}
                                        value={cuerpo}
                                        onChange={(e) => setCuerpo(e.target.value)}
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <button onClick={handleUpdatePreview} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                            <FaSync /> Actualizar Vista
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600"
                                            checked={cerrarTicket}
                                            onChange={(e) => setCerrarTicket(e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Cerrar Ticket al enviar</span>
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

                    {/* DERECHA: VISTA PREVIA */}
                    <div className="w-2/3 bg-gray-200 p-8 flex flex-col items-center justify-center relative">
                        {loadingPreview ? (
                            <div className="text-gray-500 animate-pulse">Generando vista previa...</div>
                        ) : htmlPreview ? (
                            <div className="bg-white shadow-2xl w-full h-full max-w-[800px] overflow-hidden rounded">
                                <iframe srcDoc={htmlPreview} className="w-full h-full border-none" title="Preview" />
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center">
                                <FaEye size={40} className="mx-auto mb-2 opacity-50"/>
                                <p>Seleccione una plantilla para ver el documento</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">Cancelar</button>
                    <button 
                        onClick={handleEnviar}
                        disabled={selectedPlantillaId === '' || loading}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaPaperPlane /> {loading ? 'Enviando...' : 'Enviar Respuesta'}
                    </button>
                </div>
            </div>
        </div>
    );
};