import { useState, useEffect } from 'react';
import { plantillaService } from '../services/plantillaService';
import type { CrearPlantillaRequest } from '../type';
import { FaArrowLeft, FaEye } from 'react-icons/fa';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export const PlantillaCreatePage = ({ onClose, onSuccess }: Props) => {
    
    // Estado del Formulario
    const [formData, setFormData] = useState<CrearPlantillaRequest>({
        nombreInterno: '',
        tituloVisible: '',
        tipoCaso: 'RECLAMO',
        cuerpo: '',
        despedida: '',
        htmlModelo: '' 
    });

    const [previewHtml, setPreviewHtml] = useState<string>(''); 
    const [loading, setLoading] = useState(false);
    
    // ESTADO NUEVO: Aquí guardaremos el esqueleto que viene de Java
    const [baseHtml, setBaseHtml] = useState<string>(''); 

    // 1. EFECTO: Cargar el HTML base apenas entramos a la pantalla
    useEffect(() => {
        const cargarDiseno = async () => {
            try {
                const html = await plantillaService.getHtmlBase();
                setBaseHtml(html);
                console.log("Diseño base cargado correctamente");
            } catch (error) {
                console.error("No se pudo cargar el diseño base", error);
            }
        };
        cargarDiseno();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. FUNCIÓN MODIFICADA: Ya no tiene HTML hardcodeado
    const handlePreviewClick = () => {
        if (!baseHtml) {
            alert("El diseño base aún no ha cargado del servidor. Espera un momento.");
            return;
        }

        // Datos simulados para la vista previa (igual que antes)
        const fechaSimulada = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
        
        // Reemplazamos sobre la variable baseHtml que vino del Backend
        // Usamos expresiones regulares /.../g para reemplazar todas las ocurrencias
        let htmlFinal = baseHtml
            .replace(/\$\{numero_ticket\}/g, '2025-NEW')
            .replace(/\$\{fecha_actual\}/g, fechaSimulada)
            .replace(/\$\{nombre_cliente\}/g, 'Juan Pérez (Vista Previa)')
            // Si tu HTML tiene esta variable opcional
            .replace(/\$\{identificador_servicio.*?\}/g, '999-000-000') 
            
            // Inyectamos los datos del formulario
            .replace(/\$\{titulo\}/g, formData.tituloVisible || '[TÍTULO]')
            .replace(/\$\{despedida\}/g, formData.despedida || '[Firma]');

        // Truco para el cuerpo: Convertir saltos de línea en <br>
        const cuerpoFormat = formData.cuerpo 
            ? formData.cuerpo.replace(/\n/g, '<br>') 
            : '[El contenido aparecerá aquí...]';
            
        htmlFinal = htmlFinal.replace(/\$\{cuerpo\}/g, cuerpoFormat);
        
        setPreviewHtml(htmlFinal);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await plantillaService.create(formData);
            alert('¡Plantilla creada exitosamente!');
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error al crear la plantilla.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <div className="border-b border-gray-200 px-8 py-4 flex items-center">
                <button onClick={onClose} className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
                    <FaArrowLeft /> Volver
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* IZQUIERDA: VISTA PREVIA */}
                <div className="w-1/2 bg-gray-50 p-8 border-r border-gray-200 flex flex-col items-center justify-center overflow-y-auto">
                    <div className="bg-white shadow-md border border-gray-200 w-full max-w-lg h-[600px] rounded-lg overflow-hidden relative">
                        {previewHtml ? (
                            <iframe srcDoc={previewHtml} className="w-full h-full border-none" title="Vista Previa" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center">
                                <div className="text-4xl mb-2">📄</div>
                                <p>Completa los campos y haz clic en <b>"Vista previa"</b>.</p>
                                {!baseHtml && <p className="text-xs text-orange-500 mt-2">Cargando diseño del servidor...</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* DERECHA: FORMULARIO */}
                <div className="w-1/2 p-10 overflow-y-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Crear nueva Plantilla</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre interno</label>
                            <input type="text" name="nombreInterno" value={formData.nombreInterno} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título visible</label>
                            <input type="text" name="tituloVisible" value={formData.tituloVisible} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                            <select name="tipoCaso" value={formData.tipoCaso} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500 bg-white">
                                <option value="RECLAMO">Reclamo</option>
                                <option value="QUEJA">Queja</option>
                                <option value="SOLICITUD">Solicitud</option>
                                <option value="CONSULTA">Consulta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cuerpo</label>
                            <textarea name="cuerpo" value={formData.cuerpo} onChange={handleChange} rows={6} className="w-full border p-2 rounded outline-none focus:border-blue-500 resize-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Despedida</label>
                            <input type="text" name="despedida" value={formData.despedida} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500" required />
                        </div>

                        <div className="flex justify-between pt-6 border-t mt-4">
                            <button type="button" onClick={handlePreviewClick} className="text-blue-600 font-bold border border-blue-500 px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                                <FaEye /> Vista previa
                            </button>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-600">Cancelar</button>
                                <button type="submit" disabled={loading} className="bg-green-500 text-white font-bold px-4 py-2 rounded hover:bg-green-600">
                                    {loading ? 'Guardando...' : 'Crear'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};