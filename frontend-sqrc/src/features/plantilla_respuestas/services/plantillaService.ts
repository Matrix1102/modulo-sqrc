import axios from 'axios';
import type {
    PlantillaResumen,
    PlantillaDetalle,
    CrearPlantillaRequest,
    ActualizarPlantillaRequest
} from '../type';

// Ajusta esto si usas variables de entorno en el proyecto real
const API_URL = 'http://localhost:8080/plantilla_respuesta';

export const plantillaService = {
    getAll: async (): Promise<PlantillaResumen[]> => {
        const response = await axios.get<PlantillaResumen[]>(API_URL);
        return response.data;
    },

    getByCaso: async (caso: string): Promise<PlantillaResumen[]> => {
        const response = await axios.get<PlantillaResumen[]>(`${API_URL}/por-caso/${caso}`);
        return response.data;
    },

    getDetalleById: async (id: number): Promise<PlantillaDetalle> => {
        const response = await axios.get<PlantillaDetalle>(`${API_URL}/detalle/${id}`);
        return response.data;
    },

    create: async (data: CrearPlantillaRequest): Promise<PlantillaDetalle> => {
        const response = await axios.post<PlantillaDetalle>(API_URL, data);
        return response.data;
    },

    update: async (id: number, data: ActualizarPlantillaRequest): Promise<PlantillaDetalle> => {
        const response = await axios.put<PlantillaDetalle>(`${API_URL}/${id}`, data);
        return response.data;
    },

    desactivar: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    },

    reactivar: async (id: number): Promise<void> => {
        await axios.put(`${API_URL}/${id}/reactivar`);
    },
    // 9. OBTENER HTML BASE
    getHtmlBase: async (): Promise<string> => {
        // Le decimos a Axios que esperamos un objeto con la propiedad 'contenido'
        const response = await axios.get<{ contenido: string }>(`${API_URL}/html-base`);
        
        // Devolvemos solo el string del HTML
        return response.data.contenido;
    }
};