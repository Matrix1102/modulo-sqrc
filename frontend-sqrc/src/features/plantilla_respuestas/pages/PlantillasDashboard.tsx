import { useState } from 'react';
import { plantillaService } from '../services/plantillaService';
import type { PlantillaResumen } from '../type';
import { PlantillaListTable } from '../components/PlantillaListTable';
import { PlantillaDetailCard } from '../components/PlantillaDetailCard';
import { FaFilter } from 'react-icons/fa';

// Importamos el Hook
import { usePlantillas } from '../hooks/usePlantillas';

import { PlantillaCreatePage } from './PlantillaCreatePage';
import { PlantillaEditPage } from './PlantillaEditPage';

export const PlantillasDashboard = () => {
    // Estado para el filtro
    const [filtroCaso, setFiltroCaso] = useState<string>('TODOS');

    // USAMOS EL HOOK (Toda la lógica de carga está aquí)
    const { plantillas, loading, recargar } = usePlantillas(filtroCaso);

    // Estados de Selección y Navegación
    const [selected, setSelected] = useState<PlantillaResumen | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Handlers
    const handleToggleStatus = async (id: number, isActive: boolean) => {
        if (!confirm(`¿Deseas ${isActive ? 'desactivar' : 'reactivar'} esta plantilla?`)) return;
        try {
            if (isActive) await plantillaService.desactivar(id);
            else await plantillaService.reactivar(id);

            recargar(); // Usamos la función del hook para refrescar la tabla
            setSelected(null); // Deseleccionamos para evitar inconsistencias
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    const handleEdit = (id: number) => {
        setEditingId(id);
    };

    // --- VISTAS ---

    if (isCreating) {
        return (
            <PlantillaCreatePage
                onClose={() => setIsCreating(false)}
                onSuccess={() => {
                    setIsCreating(false);
                    recargar(); // Refrescamos al volver
                }}
            />
        );
    }

    if (editingId) {
        return (
            <PlantillaEditPage
                id={editingId}
                onClose={() => setEditingId(null)}
                onSuccess={() => {
                    setEditingId(null);
                    recargar(); // Refrescamos al volver
                }}
            />
        );
    }

    // DASHBOARD
    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Plantillas</h1>
                        <p className="text-gray-500 mt-1">Administra las respuestas automáticas</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <FaFilter />
                            </div>
                            <select
                                value={filtroCaso}
                                onChange={(e) => setFiltroCaso(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium h-full cursor-pointer hover:border-gray-400 outline-none"
                            >
                                <option value="TODOS">Todas las Categorías</option>
                                <option value="RECLAMO">Reclamos</option>
                                <option value="QUEJA">Quejas</option>
                                <option value="SOLICITUD">Solicitudes</option>
                                <option value="CONSULTA">Consultas</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition flex items-center gap-2"
                        >
                            <span>+</span> Crear Nueva
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-200">
                                <p className="text-gray-500">Cargando plantillas...</p>
                            </div>
                        ) : (
                            <PlantillaListTable
                                plantillas={plantillas}
                                selectedId={selected?.id || null}
                                onSelect={setSelected}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <PlantillaDetailCard
                            plantilla={selected}
                            onToggleStatus={handleToggleStatus}
                            onEdit={handleEdit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};