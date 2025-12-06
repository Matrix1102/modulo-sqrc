/**
 * API Service para Workflow de Tickets (Escalamiento, Derivación, Respuestas)
 * 
 * Endpoints del Backend:
 * - POST /api/v1/tickets/{id}/escalar
 * - POST /api/v1/tickets/{id}/rechazar-escalamiento
 * - POST /api/v1/tickets/{id}/derivar
 * - POST /api/v1/tickets/{id}/respuesta-externa
 */

import http from '../../../services/http';
import type {
  EscalarTicketRequest,
  RechazarEscalamientoDTO,
  DerivarTicketRequest,
  RespuestaDerivacionDTO,
} from '../types';

const WORKFLOW_ENDPOINT = '/api/v1/tickets';

// ==================== Escalamiento ====================

/**
 * Escala un ticket de Agente a BackOffice
 * 
 * @param ticketId ID del ticket a escalar
 * @param request Datos del escalamiento (asunto, problemática, justificación)
 * @returns Mensaje de confirmación
 */
export async function escalarTicket(
  ticketId: number,
  request: EscalarTicketRequest
): Promise<string> {
  const response = await http.post<string>(
    `${WORKFLOW_ENDPOINT}/${ticketId}/escalar`,
    request
  );
  return response.data;
}

// ==================== Rechazo de Escalamiento ====================

/**
 * Rechaza un escalamiento y devuelve el ticket al Agente con feedback
 * 
 * @param ticketId ID del ticket escalado a rechazar
 * @param request Datos del rechazo (asunto, motivo, instrucciones)
 * @returns Mensaje de confirmación
 */
export async function rechazarEscalamiento(
  ticketId: number,
  request: RechazarEscalamientoDTO
): Promise<string> {
  const response = await http.post<string>(
    `${WORKFLOW_ENDPOINT}/${ticketId}/rechazar-escalamiento`,
    request
  );
  return response.data;
}

// ==================== Derivación ====================

/**
 * Deriva un ticket de BackOffice a un área externa
 * 
 * @param ticketId ID del ticket a derivar
 * @param request Datos de la derivación (areaDestinoId, asunto, cuerpo)
 * @returns Mensaje de confirmación
 */
export async function derivarTicket(
  ticketId: number,
  request: DerivarTicketRequest
): Promise<string> {
  const response = await http.post<string>(
    `${WORKFLOW_ENDPOINT}/${ticketId}/derivar`,
    request
  );
  return response.data;
}

// ==================== Respuesta Externa ====================

/**
 * Registra la respuesta recibida de un área externa
 * 
 * @param ticketId ID del ticket que recibe la respuesta
 * @param respuesta Datos de la respuesta (solucionado, detalles)
 * @returns Mensaje de confirmación
 */
export async function registrarRespuestaExterna(
  ticketId: number,
  respuesta: RespuestaDerivacionDTO
): Promise<string> {
  const response = await http.post<string>(
    `${WORKFLOW_ENDPOINT}/${ticketId}/respuesta-externa`,
    respuesta
  );
  return response.data;
}
