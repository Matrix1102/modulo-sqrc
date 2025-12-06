/**
 * API Service para Gestión de Tickets
 */

import http from '../../../services/http';
import type {
  TicketListItem,
  TicketDetail,
  CreateTicketRequest,
  TicketCreatedResponse,
  DocumentacionDTO,
  CreateDocumentacionRequest,
  AsignacionDTO,
  TicketFilter,
  ClienteDTO,
  CorreoDTO,
  CierreValidacionResponse,
  NotificacionExternaDTO,
} from '../types';

const TICKETS_ENDPOINT = '/api/tickets';
const CLIENTES_ENDPOINT = '/api/v1/vista360/cliente';

// ==================== Tickets ====================

/**
 * Obtiene todos los tickets con filtros opcionales
 */
export async function getTickets(filter?: TicketFilter): Promise<TicketListItem[]> {
  const params = new URLSearchParams();
  if (filter?.tipo) params.append('tipo', filter.tipo);
  if (filter?.estado) params.append('estado', filter.estado);
  if (filter?.fecha) params.append('fecha', filter.fecha);
  if (filter?.search) params.append('search', filter.search);

  const queryString = params.toString();
  const url = queryString ? `${TICKETS_ENDPOINT}?${queryString}` : TICKETS_ENDPOINT;

  const response = await http.get<TicketListItem[]>(url);
  return response.data;
}

/**
 * Obtiene un ticket por ID
 */
export async function getTicketById(id: number): Promise<TicketDetail> {
  const response = await http.get<TicketDetail>(`${TICKETS_ENDPOINT}/${id}`);
  return response.data;
}

/**
 * Crea un nuevo ticket
 */
export async function createTicket(request: CreateTicketRequest): Promise<TicketCreatedResponse> {
  const response = await http.post<TicketCreatedResponse>(TICKETS_ENDPOINT, request);
  return response.data;
}

/**
 * Escala un ticket al BackOffice
 */
export async function escalarTicket(
  ticketId: number,
  data: { agenteId: number; backofficeId: number; motivo: string }
): Promise<void> {
  await http.post(`${TICKETS_ENDPOINT}/${ticketId}/escalar`, data);
}

/**
 * Deriva un ticket a un área
 */
export async function derivarTicket(
  ticketId: number,
  data: { backofficeId: number; areaId: number; motivo: string }
): Promise<void> {
  await http.post(`${TICKETS_ENDPOINT}/${ticketId}/derivar`, data);
}

/**
 * Cierra un ticket
 */
export async function cerrarTicket(ticketId: number, empleadoId: number): Promise<void> {
  await http.post(`${TICKETS_ENDPOINT}/${ticketId}/cerrar`, null, {
    params: { empleadoId },
  });
}

/**
 * Verifica si un ticket puede ser cerrado.
 * Retorna el estado de los requisitos (respuesta enviada, documentación).
 */
export async function verificarCierre(ticketId: number): Promise<CierreValidacionResponse> {
  const response = await http.get<CierreValidacionResponse>(`${TICKETS_ENDPOINT}/${ticketId}/puede-cerrar`);
  return response.data;
}

// ==================== Documentación ====================

/**
 * Obtiene la documentación de un ticket
 */
export async function getDocumentacion(ticketId: number): Promise<DocumentacionDTO[]> {
  const response = await http.get<DocumentacionDTO[]>(`${TICKETS_ENDPOINT}/${ticketId}/documentacion`);
  return response.data;
}

/**
 * Agrega documentación a un ticket
 */
export async function addDocumentacion(
  ticketId: number,
  data: CreateDocumentacionRequest
): Promise<DocumentacionDTO> {
  const response = await http.post<DocumentacionDTO>(
    `${TICKETS_ENDPOINT}/${ticketId}/documentacion`,
    data
  );
  return response.data;
}

// ==================== Asignaciones ====================

/**
 * Obtiene las asignaciones de un ticket
 */
export async function getAsignaciones(ticketId: number): Promise<AsignacionDTO[]> {
  const response = await http.get<AsignacionDTO[]>(`${TICKETS_ENDPOINT}/${ticketId}/asignaciones`);
  return response.data;
}

// ==================== Correos / Hilo ====================

/**
 * Obtiene el hilo de correos (historial de comunicaciones) de un ticket.
 * Incluye correos de escalamiento, derivación y respuestas.
 */
export async function getCorreos(ticketId: number): Promise<CorreoDTO[]> {
  const response = await http.get<CorreoDTO[]>(`${TICKETS_ENDPOINT}/${ticketId}/correos`);
  return response.data;
}

/**
 * Obtiene las notificaciones externas (derivaciones) de un ticket.
 * Muestra el historial de derivaciones a áreas externas.
 */
export async function getNotificacionesExternas(ticketId: number): Promise<NotificacionExternaDTO[]> {
  const response = await http.get<NotificacionExternaDTO[]>(`${TICKETS_ENDPOINT}/${ticketId}/notificaciones-externas`);
  return response.data;
}

// ==================== Clientes ====================

/**
 * Busca un cliente por DNI
 */
export async function buscarClientePorDni(dni: string): Promise<ClienteDTO> {
  const response = await http.get<ClienteDTO>(`${CLIENTES_ENDPOINT}/buscar`, {
    params: { dni },
  });
  return response.data;
}

/**
 * Obtiene un cliente por ID
 */
export async function getClienteById(id: number): Promise<ClienteDTO> {
  const response = await http.get<ClienteDTO>(`${CLIENTES_ENDPOINT}/${id}`);
  return response.data;
}

// ==================== Export como objeto ====================

export const ticketApi = {
  getTickets,
  getTicketById,
  createTicket,
  escalarTicket,
  derivarTicket,
  cerrarTicket,
  verificarCierre,
  getDocumentacion,
  addDocumentacion,
  getAsignaciones,
  getCorreos,
  getNotificacionesExternas,
  buscarClientePorDni,
  getClienteById,
};
