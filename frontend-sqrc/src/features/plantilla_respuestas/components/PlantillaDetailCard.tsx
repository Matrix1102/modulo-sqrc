import type { PlantillaResumen } from '../type';

interface Props {
    plantilla: PlantillaResumen | null;
    onToggleStatus: (id: number, currentStatus: boolean) => void;
    onEdit: (id: number) => void;
}

export const PlantillaDetailCard = ({ plantilla, onToggleStatus, onEdit }: Props) => {

    if (!plantilla) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center h-64 flex flex-col justify-center items-center text-gray-400">
                <p>Selecciona una plantilla para ver sus detalles</p>
        </div>
    );
    }

    const formatDate = (dateString: string) => {
        if(!dateString) return '--/--/----';
        return new Date(dateString).toLocaleDateString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour:'2-digit', minute:'2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            Detalles de Plantilla
    </h2>

    <div className="space-y-4 text-sm text-gray-600 mb-8">
    <div className="flex justify-between">
    <span className="font-semibold">Creada el:</span>
    <span>{formatDate(plantilla.creada)}</span>
    </div>

    <div className="flex justify-between">
    <span className="font-semibold">Última modificación:</span>
    <span>{formatDate(plantilla.modificada)}</span>
    </div>

    <div className="flex justify-between">
    <span className="font-semibold">Categoría:</span>
    <span className="font-medium text-gray-800">{plantilla.categoria}</span>
        </div>
        </div>

        <div className="flex gap-3 mt-6">
    <button
        onClick={() => onEdit(plantilla.id)}
    className="flex-1 bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
        Editar
        </button>

    {plantilla.activa ? (
        <button
            onClick={() => onToggleStatus(plantilla.id, true)}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
            Desactivar
            </button>
    ) : (
        <button
            onClick={() => onToggleStatus(plantilla.id, false)}
        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
            Reactivar
            </button>
    )}
    </div>
    </div>
);
};