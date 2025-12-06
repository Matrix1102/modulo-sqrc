/**
 * Tipos para el módulo Simulador de Área Externa
 * Este módulo simula el sistema de un área externa que recibe derivaciones
 */

import type { NotificacionExternaDTO } from '../../tickets/types';

/**
 * DTO para ticket derivado en el simulador
 * Coincide con TicketDerivadoSimuladorDTO.java del backend
 */
export interface TicketDerivadoSimuladorDTO {
  idTicket: number;
  asunto: string;
  descripcion: string;
  notificacion: NotificacionExternaDTO;
}

/**
 * Request para registrar respuesta de área externa
 * Reutiliza el tipo del módulo de tickets
 */
export interface RegistrarRespuestaRequest {
  respuestaExterna: string;
  solucionado: boolean;
}

/**
 * Mapeo de IDs de área a nombres (debe coincidir con la BD)
 */
export const AREAS_MAP: Record<number, string> = {
  1: 'Tecnología de la Información',
  2: 'Ventas',
  3: 'Infraestructura',
  4: 'Recursos Humanos',
  5: 'Finanzas',
};
