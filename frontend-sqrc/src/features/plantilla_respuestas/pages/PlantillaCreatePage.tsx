import { useState } from 'react';
import { plantillaService } from '../services/plantillaService';
import type { CrearPlantillaRequest } from '../type'; // Importar Type
import { FaArrowLeft, FaEye} from 'react-icons/fa';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export const PlantillaCreatePage = ({ onClose, onSuccess }: Props) => {

    const [formData, setFormData] = useState<CrearPlantillaRequest>({
        nombreInterno: '',
        tituloVisible: '',
        tipoCaso: 'RECLAMO',
        cuerpo: '',
        despedida: '',
        htmlModelo: '' // Vacío para usar default del backend
    });

    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Simulación Local de Vista Previa (Hoja Bond)
    const handlePreviewClick = () => {
        
        // ESTE HTML AHORA COINCIDE CON TU BASE DE DATOS
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Arial', sans-serif; background-color: #f0f0f0; margin: 0; padding: 20px; }
                    /* Estilo de Hoja Bond Centrada */
                    .hoja-carta { 
                        background-color: #ffffff; 
                        width: 100%; 
                        max-width: 650px; 
                        margin: 0 auto; 
                        padding: 50px 60px; 
                        border: 1px solid #ccc; 
                        box-shadow: 0 0 10px rgba(0,0,0,0.1); 
                        box-sizing: border-box; 
                        min-height: 800px;
                    }
                    .header-expediente { text-align: right; font-weight: bold; font-size: 10pt; margin-bottom: 40px; }
                    .fecha { margin-bottom: 30px; font-size: 11pt; }
                    .cliente-info { margin-bottom: 20px; line-height: 1.5; font-size: 11pt; }
                    .referencia-tabla { width: 100%; margin-bottom: 30px; font-size: 11pt; }
                    .referencia-tabla td { padding-bottom: 5px; vertical-align: top; }
                    .saludo { margin-bottom: 20px; font-size: 11pt; }
                    .contenido { text-align: justify; line-height: 1.5; font-size: 11pt; min-height: 150px; margin-bottom: 50px; }
                    .despedida { margin-top: 40px; font-size: 11pt; }
                </style>
            </head>
            <body>
                <div class="hoja-carta">
                    <div class="header-expediente">EXPEDIENTE: 2025-NEW</div>
                    
                    <div class="fecha">
                        ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>

                    <div class="cliente-info">
                        Señor(a):<br>
                        <strong>[Nombre del Cliente]</strong>
                    </div>

                    <table class="referencia-tabla" border="0">
                        <tr>
                            <td width="120">Servicio/Línea</td>
                            <td width="15">:</td>
                            <td>000-000-000</td>
                        </tr>
                        <tr>
                            <td>Referencia</td>
                            <td>:</td>
                            <td>Nuevo Caso</td>
                        </tr>
                    </table>

                    <div class="saludo">De nuestra mayor consideración:</div>

                    <div class="contenido">
                        <div style="text-align: center; margin-bottom: 25px; font-weight: bold; text-decoration: underline;">
                            ${formData.tituloVisible || '[Escribe un título]'}
                        </div>

                        ${formData.cuerpo ? formData.cuerpo.replace(/\n/g, '<br>') : '[Escribe el contenido del correo...]'}
                    </div>

                    <div class="despedida">
                        ${formData.despedida || '[Escribe la despedida]'}
                    </div>
                </div>
            </body>
            </html>
        `;
        
        setPreviewHtml(html);
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
                                <p>Completa los campos y haz clic en <b>"Vista previa"</b>.</p>
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

                        <div className="flex justify-between pt-6">
                            <button type="button" onClick={handlePreviewClick} className="text-blue-600 font-bold border border-blue-500 px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2"><FaEye /> Vista previa</button>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-600">Cancelar</button>
                                <button type="submit" disabled={loading} className="bg-green-500 text-white font-bold px-4 py-2 rounded hover:bg-green-600">{loading ? 'Guardando...' : 'Crear'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};