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
            // Usamos el endpoint específico de DETALLE
            const data = await plantillaService.getDetalleById(id);

            setFormData({
                nombreInterno: data.nombreInterno,
                tituloVisible: data.tituloVisible,
                tipoCaso: data.categoria, // Mapeo correcto
                cuerpo: data.cuerpo,
                despedida: data.despedida,
                htmlModelo: data.htmlModel,
                activo: true
            });
            // Generar vista previa con el HTML real que vino de la BD
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
            <div className="border-b px-8 py-4 flex justify-between items-center">
                <button onClick={onClose} className="text-gray-600 font-bold flex gap-2 hover:text-blue-600"><FaArrowLeft /> Volver</button>
                <div className="text-sm text-gray-400">Editando ID: #{id}</div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* IZQUIERDA */}
                <div className="w-1/2 bg-gray-100 p-8 border-r flex flex-col items-center justify-center overflow-y-auto">
                    <div className="bg-white shadow w-full max-w-lg h-[600px] rounded overflow-hidden">
                        <iframe srcDoc={previewHtml} className="w-full h-full border-none" />
                    </div>
                </div>

                {/* DERECHA */}
                <div className="w-1/2 p-10 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6">Editar Plantilla</h1>
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                        {/* Mismos inputs que en Crear, pero con los valores cargados */}
                        <div><label className="block font-bold text-gray-500 text-xs mb-1">NOMBRE</label>
                            <input type="text" name="nombreInterno" value={formData.nombreInterno} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500" /></div>

                        <div><label className="block font-bold text-gray-500 text-xs mb-1">TÍTULO</label>
                            <input type="text" name="tituloVisible" value={formData.tituloVisible} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500" /></div>

                        <div><label className="block font-bold text-gray-500 text-xs mb-1">CATEGORÍA</label>
                            <select name="tipoCaso" value={formData.tipoCaso} onChange={handleChange} className="w-full border p-2 rounded bg-white"><option value="RECLAMO">Reclamo</option><option value="QUEJA">Queja</option><option value="SOLICITUD">Solicitud</option><option value="CONSULTA">Consulta</option></select></div>

                        <div><label className="block font-bold text-gray-500 text-xs mb-1">CUERPO</label>
                            <textarea name="cuerpo" value={formData.cuerpo} onChange={handleChange} rows={8} className="w-full border p-2 rounded outline-none focus:border-blue-500 resize-none" /></div>

                        <div><label className="block font-bold text-gray-500 text-xs mb-1">DESPEDIDA</label>
                            <input type="text" name="despedida" value={formData.despedida} onChange={handleChange} className="w-full border p-2 rounded outline-none focus:border-blue-500" /></div>

                        <div className="flex justify-between pt-6 border-t mt-4">
                            <button type="button" onClick={handlePreviewClick} className="text-blue-600 font-bold flex gap-2 items-center"><FaEye/> Actualizar Vista</button>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex gap-2 items-center">{saving ? '...' : <><FaSave/> Guardar</>}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};