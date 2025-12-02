import { useState, useEffect, useCallback } from 'react';
import { plantillaService } from '../services/plantillaService';
import type { PlantillaResumen } from '../type';

export const usePlantillas = (filtroCaso: string) => {
    const [plantillas, setPlantillas] = useState<PlantillaResumen[]>([]);
    const [loading, setLoading] = useState(true);

    // Función memorizada para cargar datos
    const cargarPlantillas = useCallback(async () => {
        setLoading(true);
        try {
            let data;
            if (filtroCaso === 'TODOS') {
                data = await plantillaService.getAll();
            } else {
                data = await plantillaService.getByCaso(filtroCaso);
            }
            setPlantillas(data);
        } catch (error) {
            console.error("Error al cargar plantillas", error);
        } finally {
            setLoading(false);
        }
    }, [filtroCaso]);

    // Efecto que reacciona al cambio de filtro
    useEffect(() => {
        cargarPlantillas();
    }, [cargarPlantillas]);

    // Retornamos los datos y la función para recargar manual
    return {
        plantillas,
        loading,
        recargar: cargarPlantillas
    };
};