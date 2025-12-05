import axios from 'axios';
import type { EnviarRespuestaRequest, RespuestaBorradorDTO, PreviewResponseDTO } from '../type/index.ts'; 

// Ajusta la URL si es necesario
const API_URL = 'http://localhost:8080/respuestas';

export const respuestaService = {

    // 1. OBTENER BORRADOR (Carga inicial al seleccionar plantilla)
    obtenerBorrador: async (ticketId: number, plantillaId: number) => {
        const response = await axios.get<RespuestaBorradorDTO>(`${API_URL}/borrador`, {
            params: { ticketId, plantillaId }
        });
        return response.data;
    },

    // 2. SIMULAR VISTA PREVIA (Al editar el texto)
    simular: async (data: EnviarRespuestaRequest) => {
        const response = await axios.post<PreviewResponseDTO>(`${API_URL}/preview`, data);
        return response.data;
    },

    // 3. ENVIAR RESPUESTA FINAL
    enviar: async (data: EnviarRespuestaRequest) => {
        const response = await axios.post<string>(`${API_URL}/enviar`, data);
        return response.data;
    }
};