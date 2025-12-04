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
  problema: string;
  solucion: string;
  empleadoId: number;
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
  fechaInicio?: string;
  fechaFin?: string;
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

export const ESTADO_CONFIG: Record<EstadoTicket, { label: string; color: string; bgColor: string }> = {
  ABIERTO: { label: 'Abierto', color: 'text-green-700', bgColor: 'bg-green-100' },
  ESCALADO: { label: 'Escalado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  DERIVADO: { label: 'Derivado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CERRADO: { label: 'Cerrado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export const TIPO_CONFIG: Record<TipoTicket, { label: string; color: string; bgColor: string; icon: string }> = {
  CONSULTA: { label: 'Consulta', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '❓' },
  QUEJA: { label: 'Queja', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '😤' },
  RECLAMO: { label: 'Reclamo', color: 'text-red-700', bgColor: 'bg-red-100', icon: '⚠️' },
  SOLICITUD: { label: 'Solicitud', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '📋' },
};
