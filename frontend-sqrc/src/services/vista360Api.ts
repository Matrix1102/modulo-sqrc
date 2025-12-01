/**
 * API Service para Vista 360 Cliente
 * Conecta el frontend React con el backend Spring Boot
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const VISTA360_ENDPOINT = `${API_BASE_URL}/api/v1/vista360/cliente`;

// ==================== Types ====================

export interface ClienteBasicoDTO {
  idCliente: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // ISO format: "YYYY-MM-DD"
  correo: string;
  telefono: string;
  celular: string;
}

export interface MetricaKPI {
  titulo: string;
  valorPrincipal: string;
  unidad: string;
  subtituloTendencia: string;
  estadoTendencia: 'POSITIVO' | 'NEGATIVO' | 'NEUTRO';
}

export interface ActualizarClienteDTO {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  telefono?: string;
  celular: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

// ==================== API Functions ====================

/**
 * Obtiene los datos básicos de un cliente por su ID
 */
export async function obtenerClientePorId(id: number): Promise<ClienteBasicoDTO> {
  const response = await fetch(`${VISTA360_ENDPOINT}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca un cliente por su DNI
 */
export async function buscarClientePorDni(dni: string): Promise<ClienteBasicoDTO> {
  const response = await fetch(`${VISTA360_ENDPOINT}/buscar?dni=${encodeURIComponent(dni)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene las métricas KPI de un cliente
 */
export async function obtenerMetricasCliente(id: number): Promise<MetricaKPI[]> {
  const response = await fetch(`${VISTA360_ENDPOINT}/${id}/metricas`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Actualiza la información del cliente (PATCH)
 */
export async function actualizarInformacionCliente(
  id: number,
  datos: ActualizarClienteDTO
): Promise<ClienteBasicoDTO> {
  const response = await fetch(`${VISTA360_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check del controlador
 */
export async function healthCheck(): Promise<string> {
  const response = await fetch(`${VISTA360_ENDPOINT}/health`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.text();
}

// ==================== Tickets Types ====================

export interface TicketSummary {
  id: number;
  reasonTitle: string;
  status: 'ABIERTO' | 'ESCALADO' | 'DERIVADO' | 'AUDITORIA' | 'CERRADO';
  relevantDate: string; // ISO format
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface AssignmentHistory {
  agentName: string;
  area: string;
  startDate: string; // ISO format
  endDate: string | null; // ISO format o null si aún está asignado
  stepStatus: 'EN_PROGRESO' | 'COMPLETADO';
  notes: string | null;
}

export interface TicketDetail {
  id: number;
  reasonTitle: string;
  description: string;
  status: 'ABIERTO' | 'ESCALADO' | 'DERIVADO' | 'AUDITORIA' | 'CERRADO';
  type: 'CONSULTA' | 'QUEJA' | 'RECLAMO' | 'SOLICITUD';
  channel: 'Web' | 'Email' | 'Telefono' | 'Chat' | 'API' | 'Interno' | 'App' | 'Otro';
  createdDate: string; // ISO format
  closedDate: string | null; // ISO format o null si no está cerrado
  kbArticleId: number | null;
  lastAgentName: string | null;
  assignmentHistory: AssignmentHistory[];
}

export interface TicketFilter {
  term?: string;
  dateStart?: string; // ISO format "YYYY-MM-DD"
  dateEnd?: string; // ISO format "YYYY-MM-DD"
  status?: ('ABIERTO' | 'ESCALADO' | 'DERIVADO' | 'AUDITORIA' | 'CERRADO')[];
  type?: 'CONSULTA' | 'QUEJA' | 'RECLAMO' | 'SOLICITUD';
  channel?: 'Web' | 'Email' | 'Telefono' | 'Chat' | 'API' | 'Interno' | 'App' | 'Otro';
  clienteId?: number;
}

// ==================== Tickets API Functions ====================

const TICKETS_ENDPOINT = `${API_BASE_URL}/api/v1/tickets`;

/**
 * Busca tickets aplicando filtros
 */
export async function searchTickets(filter: TicketFilter): Promise<TicketSummary[]> {
  const response = await fetch(`${TICKETS_ENDPOINT}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene el detalle completo de un ticket por su ID
 */
export async function getTicketById(id: number): Promise<TicketDetail> {
  const response = await fetch(`${TICKETS_ENDPOINT}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene todos los tickets de un cliente específico
 */
export async function getTicketsByClienteId(clienteId: number): Promise<TicketSummary[]> {
  const response = await fetch(`${TICKETS_ENDPOINT}/cliente/${clienteId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check del controlador de tickets
 */
export async function ticketsHealthCheck(): Promise<string> {
  const response = await fetch(`${TICKETS_ENDPOINT}/health`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Tickets health check failed: ${response.status}`);
  }

  return response.text();
}
