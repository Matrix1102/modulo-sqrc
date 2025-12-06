/**
 * API Service para el Simulador de Área Externa
 * 
 * Endpoints:
 * - GET /api/simulador/tickets-derivados
 * - POST /api/v1/tickets/{id}/respuesta-externa (reutilizado del workflow)
 */

import http from '../../../services/http';
import type { TicketDerivadoSimuladorDTO, RegistrarRespuestaRequest } from '../types';

const SIMULADOR_ENDPOINT = '/api/simulador';
const WORKFLOW_ENDPOINT = '/api/v1/tickets';

/**
 * Obtiene la lista de tickets derivados al área externa
 * Simula la bandeja de entrada del sistema externo
 */
export async function obtenerTicketsDerivados(): Promise<TicketDerivadoSimuladorDTO[]> {
  const response = await http.get<TicketDerivadoSimuladorDTO[]>(
    `${SIMULADOR_ENDPOINT}/tickets-derivados`
  );
  return response.data;
}

/**
 * Registra la respuesta del área externa para un ticket derivado
 * Reutiliza el endpoint del workflow principal
 */
export async function registrarRespuestaDerivacion(
  ticketId: number,
  request: RegistrarRespuestaRequest
): Promise<string> {
  const response = await http.post<string>(
    `${WORKFLOW_ENDPOINT}/${ticketId}/respuesta-externa`,
    request
  );
  return response.data;
}
