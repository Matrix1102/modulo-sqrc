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
    },
    descargarPdf: async (data: EnviarRespuestaRequest): Promise<void> => {
        const response = await axios.post(`${API_URL}/descargar-preview`, data, {
            responseType: 'blob' // <--- ¡VITAL! Dice que esperamos un archivo, no JSON
        });

        // Truco de JS para forzar la descarga del archivo recibido
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Respuesta_Ticket_${data.idAsignacion}.pdf`); // Nombre del archivo
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link); // Limpieza
    }
};