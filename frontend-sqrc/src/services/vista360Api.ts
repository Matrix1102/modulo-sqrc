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
