/**
 * Tipos para el módulo de Tickets
 */

// ==================== Enums ====================

export type EstadoTicket = 'ABIERTO' | 'ESCALADO' | 'DERIVADO' | 'CERRADO';
export type TipoTicket = 'CONSULTA' | 'QUEJA' | 'RECLAMO' | 'SOLICITUD';
export type OrigenTicket = 'LLAMADA' | 'PRESENCIAL';

// ==================== Cliente ====================

export interface ClienteDTO {
  idCliente: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
  celular: string;
  esFamiliar?: boolean;
  nombreFamiliar?: string;
}

// ==================== Ticket ====================

export interface TicketListItem {
  idTicket: number;
  asunto: string;
  estado: EstadoTicket;
  tipoTicket: TipoTicket;
  origen: OrigenTicket;
  fechaCreacion: string;
  cliente: {
    idCliente: number;
    nombre: string;
    apellido: string;
  };
}

export interface TicketDetail {
  idTicket: number;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  tipoTicket: TipoTicket;
  origen: OrigenTicket;
  fechaCreacion: string;
  fechaCierre: string | null;
  idConstancia: number | null;
  cliente: ClienteDTO;
  motivo: {
    idMotivo: number;
    descripcion: string;
  } | null;
  // Información de llamada asociada
  llamada?: {
    idLlamada: number;
    numeroOrigen: string;
    duracionSegundos: number | null;
    duracionFormateada: string | null;
  } | null;
  // Campos específicos por tipo
  consultaInfo?: { tema: string };
  quejaInfo?: { impacto: string; areaInvolucrada: string };
  reclamoInfo?: {
    motivoReclamo: string;
    fechaLimiteRespuesta: string;
    fechaLimiteResolucion: string;
    resultado: string | null;
  };
  solicitudInfo?: { tipoSolicitud: string };
}

// ==================== Requests ====================

export interface CreateTicketRequest {
  tipoTicket: TipoTicket;
  asunto: string;
  descripcion: string;
  clienteId: number;
  origen: OrigenTicket;
  empleadoId: number; // ID del agente que crea el ticket
  motivoId?: number;
  // Campos específicos por tipo
  tema?: string; // CONSULTA
  impacto?: string; // QUEJA
  areaInvolucrada?: string; // QUEJA
  motivoReclamo?: string; // RECLAMO
  tipoSolicitud?: string; // SOLICITUD
}

export interface TicketCreatedResponse {
  idTicket: number;
  idConstancia: number;
  mensaje: string;
  estado: EstadoTicket;
  fechaCreacion: string;
}

// ==================== Documentación ====================

export interface DocumentacionDTO {
  idDocumentacion: number;
  problema: string;
  solucion: string;
  fechaCreacion: string;
  empleado: {
    idEmpleado: number;
    nombre: string;
    apellido: string;
  };
}

export interface CreateDocumentacionRequest {
  ticketId?: number; // Opcional porque el backend lo establece desde el path
  problema: string;
  solucion: string;
  empleadoId: number;
  articuloKBId?: number; // ID del artículo de base de conocimiento (opcional)
}

// ==================== Asignaciones ====================

export interface AsignacionDTO {
  idAsignacion: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string | null;
  motivoDesplazamiento: string;
  area: string;
  empleado: {
    idEmpleado: number;
    nombre: string;
    apellido: string;
    tipoEmpleado: string;
  } | null;
}

// ==================== Filtros ====================

export interface TicketFilter {
  tipo?: TipoTicket;
  estado?: EstadoTicket;
  fecha?: string; // Fecha específica de creación (formato: yyyy-MM-dd)
  search?: string;
  page?: number;
  size?: number;
}

// Alias para componentes
export type TicketFilters = TicketFilter;

// ==================== Paginación ====================

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ==================== Cliente Info ====================

export interface ClienteInfo {
  idCliente: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  telefono?: string;
  celular: string;
}

// ==================== Estado Badge Config ====================
// Colores según diseño: Abierto=verde, Escalado=amarillo, Derivado=naranja, Cerrado=rojo

export const ESTADO_CONFIG: Record<EstadoTicket, { label: string; color: string; bgColor: string }> = {
  ABIERTO: { label: 'Abierto', color: 'text-white', bgColor: 'bg-green-500' },
  ESCALADO: { label: 'Escalado', color: 'text-gray-800', bgColor: 'bg-yellow-400' },
  DERIVADO: { label: 'Derivado', color: 'text-white', bgColor: 'bg-orange-400' },
  CERRADO: { label: 'Cerrado', color: 'text-white', bgColor: 'bg-red-500' },
};

// Tipos con iconos según diseño
export const TIPO_CONFIG: Record<TipoTicket, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  SOLICITUD: { label: 'Solicitud', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: '📋' },
  QUEJA: { label: 'Queja', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: '🔊' },
  CONSULTA: { label: 'Consulta', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', icon: '❓' },
  RECLAMO: { label: 'Reclamo', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: '⚠️' },
};

// ==================== Workflow (Escalamiento y Derivación) ====================

/**
 * DTO para escalar un ticket de Agente a BackOffice
 * Coincide con EscalarRequestDTO.java
 */
export interface EscalarTicketRequest {
  asunto: string;
  problematica: string;
  justificacion: string;
}

/**
 * DTO para derivar un ticket de BackOffice a un área externa
 * Coincide con DerivarRequestDTO.java
 */
export interface DerivarTicketRequest {
  areaDestinoId: number;
  asunto: string;
  cuerpo: string;
}

/**
 * DTO para registrar respuesta de área externa
 * Coincide con RespuestaDerivacionDTO.java
 */
export interface RespuestaDerivacionDTO {
  respuestaExterna: string;
  solucionado: boolean;
}

// ==================== Correo / Hilo ====================

export type TipoCorreo = 'SOLICITUD_ESCALAMIENTO' | 'RESPUESTA_INTERNA' | 'DERIVACION_EXTERNA';

/**
 * Representa un correo/movimiento en el hilo del ticket.
 * Coincide con CorreoDTO.java del backend.
 */
export interface CorreoDTO {
  idCorreo: number;
  asunto: string;
  cuerpo: string;
  fechaEnvio: string;
  tipoCorreo: TipoCorreo;
  // Información de la asignación relacionada
  idAsignacion: number;
  ticketId: number;
  // Información del empleado (destinatario)
  empleadoId: number;
  empleadoNombre: string;
  empleadoCorreo: string;
  empleadoArea: string;
}

// ==================== Notificaciones Externas (Derivación) ====================

/**
 * DTO para notificaciones externas (derivaciones a áreas externas).
 * Coincide con NotificacionExternaDTO.java del backend.
 * Ahora incluye los campos de respuesta integrados en el mismo objeto.
 */
export interface NotificacionExternaDTO {
  idNotificacion: number;
  ticketId: number;
  areaDestinoId: number;
  asunto: string;
  cuerpo: string;
  destinatarioEmail: string;
  fechaEnvio: string;
  
  // Campos de respuesta
  respuesta?: string;
  fechaRespuesta?: string;
}

/**
 * DTO para el simulador de área externa.
 * Muestra tickets derivados con su notificación.
 */
export interface TicketDerivadoSimuladorDTO {
  idTicket: number;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  fechaCreacion: string;
  notificacion: NotificacionExternaDTO;
}

// ==================== Constantes ====================

/**
 * ID único del BackOffice en el MVP
 */
export const BACKOFFICE_ID_MVP = 3;

/**
 * Áreas externas disponibles para derivación
 */
export const AREAS_EXTERNAS = [
  { id: 1, nombre: 'TI - Tecnología de la Información' },
  { id: 2, nombre: 'Ventas' },
  { id: 3, nombre: 'Infraestructura' },
] as const;

// ==================== Cierre de Ticket ====================

/**
 * Respuesta de validación para cerrar ticket.
 * Indica si el ticket puede cerrarse y el estado de los requisitos.
 */
export interface CierreValidacionResponse {
  puedeCerrar: boolean;
  tieneRespuestaEnviada: boolean;
  tieneDocumentacion: boolean;
  estadoTicket: EstadoTicket;
  mensaje: string;
}

// ==================== Llamadas ====================

export type EstadoLlamada = 'ACEPTADA' | 'DECLINADA' | 'EN_ESPERA' | 'FINALIZADA';

export interface LlamadaDto {
  idLlamada: number;
  fechaHora: string;
  duracionSegundos: number;
  duracionFormateada: string;
  numeroOrigen: string;
  estado: EstadoLlamada;
  ticketId: number | null;
  empleadoId: number | null;
  nombreEmpleado: string | null;
}
