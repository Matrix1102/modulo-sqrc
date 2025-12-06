/**
 * API client para gestión de llamadas
 */
import { http } from '../../../services/http';
import type { LlamadaDto, EstadoLlamada } from '../types';

interface CreateLlamadaRequest {
  empleadoId: number;
  numeroOrigen: string;
  estado?: EstadoLlamada;
}

interface AsociarLlamadaRequest {
  llamadaId: number;
  ticketId: number;
}

/**
 * Crear una nueva llamada
 */
export const crearLlamada = async (data: CreateLlamadaRequest): Promise<LlamadaDto> => {
  const response = await http.post<LlamadaDto>('/api/v1/llamadas', data);
  return response.data;
};

/**
 * Asociar llamada existente a un ticket
 */
export const asociarLlamadaATicket = async (
  data: AsociarLlamadaRequest
): Promise<LlamadaDto> => {
  const response = await http.post<LlamadaDto>('/api/v1/llamadas/asociar', data);
  return response.data;
};

/**
 * Finalizar una llamada
 */
export const finalizarLlamada = async (
  llamadaId: number,
  duracionSegundos: number
): Promise<LlamadaDto> => {
  const response = await http.patch<LlamadaDto>(
    `/api/v1/llamadas/${llamadaId}/finalizar`,
    null,
    {
      params: { duracionSegundos },
    }
  );
  return response.data;
};

/**
 * Cambiar estado de una llamada
 */
export const cambiarEstadoLlamada = async (
  llamadaId: number,
  estado: EstadoLlamada
): Promise<LlamadaDto> => {
  const response = await http.patch<LlamadaDto>(
    `/api/v1/llamadas/${llamadaId}/estado`,
    null,
    {
      params: { estado },
    }
  );
  return response.data;
};

/**
 * Obtener llamada por ID
 */
export const obtenerLlamadaPorId = async (llamadaId: number): Promise<LlamadaDto> => {
  const response = await http.get<LlamadaDto>(`/api/v1/llamadas/${llamadaId}`);
  return response.data;
};

/**
 * Obtener llamada asociada a un ticket
 */
export const obtenerLlamadaPorTicket = async (ticketId: number): Promise<LlamadaDto | null> => {
  try {
    const response = await http.get<LlamadaDto>(`/api/v1/llamadas/ticket/${ticketId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
};

/**
 * Obtener llamadas de un empleado
 */
export const obtenerLlamadasPorEmpleado = async (
  empleadoId: number
): Promise<LlamadaDto[]> => {
  const response = await http.get<LlamadaDto[]>(`/api/v1/llamadas/empleado/${empleadoId}`);
  return response.data;
};

/**
 * Obtener llamadas disponibles (sin ticket) de un empleado
 */
export const obtenerLlamadasDisponibles = async (
  empleadoId: number
): Promise<LlamadaDto[]> => {
  const response = await http.get<LlamadaDto[]>(
    `/api/v1/llamadas/disponibles/${empleadoId}`
  );
  return response.data;
};
