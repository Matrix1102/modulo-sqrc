import { useState, useEffect } from 'react';
import { plantillaService } from '../services/plantillaService';
import type { ActualizarPlantillaRequest } from '../type';
import { FaArrowLeft, FaEye, FaSave } from 'react-icons/fa';

interface Props {
    id: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const PlantillaEditPage = ({ id, onClose, onSuccess }: Props) => {

    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');

    const [formData, setFormData] = useState<ActualizarPlantillaRequest>({
        nombreInterno: '',
        tituloVisible: '',
        tipoCaso: 'RECLAMO',
        cuerpo: '',
        despedida: '',
        htmlModelo: '',
        activo: true
    });

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            setLoadingData(true);
            const data = await plantillaService.getDetalleById(id);

            setFormData({
                nombreInterno: data.nombreInterno,
                tituloVisible: data.tituloVisible,
                tipoCaso: data.categoria,
                cuerpo: data.cuerpo,
                despedida: data.despedida,
                htmlModelo: data.htmlModel,
                activo: true
            });
            setPreviewHtml(generarHtmlSimulado(data.htmlModel, data.cuerpo, data.tituloVisible, data.despedida));
        } catch (error) {
            alert('Error al cargar plantilla');
            onClose();
        } finally {
            setLoadingData(false);
        }
    };

    const generarHtmlSimulado = (base: string, cuerpo: string, titulo: string, despedida: string) => {
        if(!base) return '';
        return base
            .replace('${titulo}', titulo)
            .replace('${cuerpo}', cuerpo)
            .replace('${despedida}', despedida)
            .replace('${numero_ticket}', '2025-EDIT')
            .replace('${nombre_cliente}', 'Cliente Editado');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePreviewClick = () => {
        setPreviewHtml(generarHtmlSimulado(formData.htmlModelo || '', formData.cuerpo, formData.tituloVisible, formData.despedida));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await plantillaService.update(id, formData);
            alert('Plantilla actualizada');
            onSuccess();
        } catch (error) {
            alert('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) return <div className="h-screen flex items-center justify-center">Cargando...</div>;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="border-b px-8 py-4 flex justify-between items-center bg-white z-10">
                <button onClick={onClose} className="text-gray-600 font-bold flex gap-2 hover:text-blue-600 items-center">
                    <FaArrowLeft /> Volver
                </button>
                <div className="text-sm text-gray-400">Editando ID: #{id}</div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* --- IZQUIERDA (PREVIEW) MODIFICADA --- */}
                {/* Cambios realizados:
                    1. Eliminado 'p-8', 'items-center', 'justify-center' del contenedor padre.
                    2. Contenedor hijo (papel): Eliminado 'max-w-lg', 'h-[600px]', 'rounded'.
                    3. Agregado 'h-full' y 'w-full' para llenar el espacio.
                */}
                <div className="w-1/2 bg-gray-200 border-r flex flex-col relative">
                    {/* Si quieres que parezca una hoja pegada a los bordes: */}
                    <div className="bg-white w-full h-full shadow-none">
                        <iframe 
                            srcDoc={previewHtml} 
                            className="w-full h-full border-none block" 
                            title="Vista Previa"
                        />
                    </div>
                </div>

                {/* --- DERECHA (FORMULARIO) --- */}
                <div className="w-1/2 p-10 overflow-y-auto bg-white">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Plantilla</h1>
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                        
                        <div>
                            <label className="block font-bold text-gray-500 text-xs mb-1">NOMBRE INTERNO</label>
                            <input 
                                type="text" 
                                name="nombreInterno" 
                                value={formData.nombreInterno} 
                                onChange={handleChange} 
                                className="w-full border p-2 rounded outline-none focus:border-blue-500 transition-colors" 
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-500 text-xs mb-1">TÍTULO VISIBLE</label>
                            <input 
                                type="text" 
                                name="tituloVisible" 
                                value={formData.tituloVisible} 
                                onChange={handleChange} 
                                className="w-full border p-2 rounded outline-none focus:border-blue-500 transition-colors" 
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-500 text-xs mb-1">CATEGORÍA</label>
                            <select 
                                name="tipoCaso" 
                                value={formData.tipoCaso} 
                                onChange={handleChange} 
                                className="w-full border p-2 rounded bg-white outline-none focus:border-blue-500"
                            >
                                <option value="RECLAMO">Reclamo</option>
                                <option value="QUEJA">Queja</option>
                                <option value="SOLICITUD">Solicitud</option>
                                <option value="CONSULTA">Consulta</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-500 text-xs mb-1">CUERPO DEL MENSAJE</label>
                            <textarea 
                                name="cuerpo" 
                                value={formData.cuerpo} 
                                onChange={handleChange} 
                                rows={10} 
                                className="w-full border p-2 rounded outline-none focus:border-blue-500 resize-none font-mono text-sm" 
                            />
                            <p className="text-xs text-gray-400 mt-1">Puedes usar HTML simple aquí si es necesario.</p>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-500 text-xs mb-1">DESPEDIDA</label>
                            <input 
                                type="text" 
                                name="despedida" 
                                value={formData.despedida} 
                                onChange={handleChange} 
                                className="w-full border p-2 rounded outline-none focus:border-blue-500" 
                            />
                        </div>

                        <div className="flex justify-between pt-6 border-t mt-8 bg-white sticky bottom-0">
                            <button 
                                type="button" 
                                onClick={handlePreviewClick} 
                                className="text-blue-600 font-bold flex gap-2 items-center hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                            >
                                <FaEye/> Refrescar Vista
                            </button>
                            
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className={`px-4 py-2 bg-blue-600 text-white font-bold rounded flex gap-2 items-center transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                >
                                    {saving ? 'Guardando...' : <><FaSave/> Guardar Cambios</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};