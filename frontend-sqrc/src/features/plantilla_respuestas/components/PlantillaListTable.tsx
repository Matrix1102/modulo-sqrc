import type { PlantillaResumen } from '../type';

interface Props {
    plantillas: PlantillaResumen[];
    selectedId: number | null;
    onSelect: (plantilla: PlantillaResumen) => void;
}

export const PlantillaListTable = ({ plantillas, selectedId, onSelect }: Props) => {

    // Usamos strings directos para evitar conflictos con Enums
    const getBadgeColor = (tipo: string) => {
        switch (tipo) {
            case 'RECLAMO': return 'bg-red-100 text-red-700';
            case 'QUEJA': return 'bg-orange-100 text-orange-700';
            case 'SOLICITUD': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Estado</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                {plantillas.map((p) => (
                    <tr
                        key={p.id}
                        onClick={() => onSelect(p)}
                        className={`cursor-pointer transition duration-150 
                                ${selectedId === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
                            `}
                    >
                        <td className="p-4 font-medium text-gray-800">
                            {p.nombre}
                            <div className="text-xs text-gray-400 font-normal">ID: #{p.id}</div>
                        </td>
                        <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(p.categoria)}`}>
                                    {p.categoria}
                                </span>
                        </td>
                        <td className="p-4">
                            {p.activa ? (
                                <span className="text-green-600 font-bold text-xs">Activa</span>
                            ) : (
                                <span className="text-gray-400 font-bold text-xs">Inactiva</span>
                            )}
                        </td>
                    </tr>
                ))}

                {plantillas.length === 0 && (
                    <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400">
                            No hay plantillas registradas.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};