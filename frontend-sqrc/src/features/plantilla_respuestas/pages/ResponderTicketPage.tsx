import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { plantillaService } from '../services/plantillaService';
import { respuestaService } from '../services/respuestaService';
import type { PlantillaResumen } from '../type';
import { FaPaperPlane, FaArrowLeft, FaSync, FaEye } from 'react-icons/fa';

export const ResponderTicketPage = () => {
    const { ticketId } = useParams(); // Leemos el ID de la URL
    const navigate = useNavigate();
    const location = useLocation();
    
    // Recibimos datos básicos del ticket desde la navegación (state)
    // Si el usuario recarga la página (F5), estos datos se pierden, así que idealmente deberías tener un fetchTicketById aquí también como respaldo.
    const ticketData = location.state?.ticket; 

    // --- ESTADOS ---
    const [plantillas, setPlantillas] = useState<PlantillaResumen[]>([]);
    const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | ''>('');
    
    const [asunto, setAsunto] = useState('');
    const [cuerpo, setCuerpo] = useState('');
    const [despedida, setDespedida] = useState('');
    const [cerrarTicket, setCerrarTicket] = useState(false);
    
    const [htmlPreview, setHtmlPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Validación de seguridad por si entran directo al link sin datos
    useEffect(() => {
        if (!ticketData) {
            alert("Faltan datos del ticket. Volviendo al listado.");
            navigate('/supervisor/tickets');
        }
    }, [ticketData, navigate]);

    // 1. CARGAR PLANTILLAS
    useEffect(() => {
        if (ticketData?.tipo) {
            plantillaService.getByCaso(ticketData.tipo).then(setPlantillas);
        }
    }, [ticketData]);

    // 2. SELECCIONAR PLANTILLA -> CARGAR BORRADOR
    const handleSelectPlantilla = async (id: number) => {
        setSelectedPlantillaId(id);
        if (!id) return;

        setLoading(true);
        try {
            const borrador = await respuestaService.obtenerBorrador(Number(ticketId), id);
            //setAsunto(borrador.titulo);
            setCuerpo(borrador.cuerpo);
            setDespedida(borrador.despedida);
            setHtmlPreview(borrador.htmlPreview);
        } catch (error) {
            console.error(error);
            alert("Error al cargar el borrador.");
        } finally {
            setLoading(false);
        }
    };

    // 3. ACTUALIZAR VISTA PREVIA
    const handleUpdatePreview = async () => {
        if (!selectedPlantillaId) return;
        setLoadingPreview(true);
        try {
            const res = await respuestaService.simular({
                idAsignacion: Number(ticketId),
                idPlantilla: Number(selectedPlantillaId),
                correoDestino: ticketData.clienteCorreo,
                asunto: asunto,
                cerrarTicket: false,
                variables: { cuerpo, despedida }
            });
            setHtmlPreview(res.htmlRenderizado);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPreview(false);
        }
    };

    // 4. ENVIAR
    const handleEnviar = async () => {
        if (!confirm("¿Enviar respuesta al cliente?")) return;
        setLoading(true);
        try {
            await respuestaService.enviar({
                idAsignacion: Number(ticketId),
                idPlantilla: Number(selectedPlantillaId),
                correoDestino: ticketData.clienteCorreo,
                asunto: asunto,
                cerrarTicket: cerrarTicket,
                variables: { cuerpo, despedida }
            });
            alert("✅ Respuesta enviada correctamente.");
            navigate(-1); // Volver atrás (al detalle del ticket)
        } catch (error) {
            alert("Error al enviar.");
        } finally {
            setLoading(false);
        }
    };

    if (!ticketData) return null;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            
            {/* HEADER DE PÁGINA */}
            <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 transition">
                        <FaArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Responder Ticket #{ticketData.numeroTicket}</h1>
                        <p className="text-xs text-gray-500">Cliente: {ticketData.clienteCorreo}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                
                {/* IZQUIERDA: FORMULARIO */}
                <div className="w-4/12 bg-white border-r p-6 overflow-y-auto flex flex-col gap-5">
                    {/* Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plantilla ({ticketData.tipo})</label>
                        <select 
                            className="w-full border border-gray-300 rounded p-2 text-sm"
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
                                <input type="text" className="w-full border rounded p-2 text-sm" value={asunto} onChange={e => setAsunto(e.target.value)} />
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mensaje</label>
                                <textarea 
                                    className="w-full border rounded p-3 text-sm flex-1 resize-none min-h-[300px]"
                                    value={cuerpo} onChange={e => setCuerpo(e.target.value)}
                                />
                                <button onClick={handleUpdatePreview} className="mt-2 text-xs text-blue-600 font-bold flex items-center gap-1 self-end hover:underline">
                                    <FaSync /> Actualizar Vista
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Despedida</label>
                                <input type="text" className="w-full border rounded p-2 text-sm" value={despedida} onChange={e => setDespedida(e.target.value)} />
                            </div>

                            <div className="p-4 bg-blue-50 rounded border border-blue-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4" checked={cerrarTicket} onChange={e => setCerrarTicket(e.target.checked)} />
                                    <span className="text-sm font-medium">Cerrar Ticket al enviar</span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* DERECHA: VISTA PREVIA */}
                <div className="w-8/12 bg-gray-100 p-8 flex flex-col items-center justify-center">
                    {loadingPreview ? (
                        <p className="text-gray-500 animate-pulse">Generando vista previa...</p>
                    ) : htmlPreview ? (
                        <div className="bg-white shadow-xl w-full h-full max-w-[800px] rounded overflow-hidden">
                            <iframe srcDoc={htmlPreview} className="w-full h-full border-none" />
                        </div>
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <FaEye size={48} className="mb-2 opacity-30"/>
                            <p>Selecciona una plantilla para comenzar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="bg-white border-t p-4 flex justify-end gap-3">
                <button onClick={() => navigate(-1)} className="px-6 py-2 border rounded font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button 
                    onClick={handleEnviar}
                    disabled={!selectedPlantillaId || loading}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    <FaPaperPlane /> {loading ? 'Enviando...' : 'Enviar Respuesta'}
                </button>
            </div>
        </div>
    );
};