import { http } from '../../../services/http';

/**
 * Tipos para los logs de auditoría
 */
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type LogCategory = 
  | 'CLIENTE'
  | 'TICKET'
  | 'TICKET_WORKFLOW'
  | 'ENCUESTA'
  | 'ARTICULO'
  | 'REPORTE'
  | 'AUTH'
  | 'ERROR'
  | 'COMUNICACION'
  | 'INTEGRACION';

export interface AuditLog {
  id: number;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  userId: number | null;
  userName: string | null;
  userType: string | null;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestUri: string | null;
  httpMethod: string | null;
  responseStatus: number | null;
  durationMs: number | null;
}

export interface ErrorLog {
  id: number;
  timestamp: string;
  exceptionType: string;
  message: string | null;
  stackTrace: string | null;
  requestUri: string | null;
  httpMethod: string | null;
  userId: number | null;
  userName: string | null;
  requestBody: string | null;
  correlationId: string | null;
  ipAddress: string | null;
}

export interface LogsResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ErrorLogsResponse {
  content: ErrorLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface LogsFilter {
  page?: number;
  size?: number;
  level?: LogLevel;
  category?: LogCategory;
  userId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ErrorLogsFilter {
  page?: number;
  size?: number;
  exceptionType?: string;
  search?: string;
}

export interface LogStats {
  total: number;
  byLevelLast24h: Record<LogLevel, number>;
  byCategoryLast24h: Record<LogCategory, number>;
}

/**
 * Obtiene los logs con paginación y filtros
 */
export async function getLogs(filters: LogsFilter = {}): Promise<LogsResponse> {
  const params = new URLSearchParams();
  
  if (filters.page !== undefined) params.append('page', String(filters.page));
  if (filters.size !== undefined) params.append('size', String(filters.size));
  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.userId) params.append('userId', String(filters.userId));
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.search) params.append('search', filters.search);
  
  const response = await http.get<LogsResponse>(`/api/logs?${params.toString()}`);
  return response.data;
}

/**
 * Obtiene los logs de errores con paginación y filtros
 */
export async function getErrorLogs(filters: ErrorLogsFilter = {}): Promise<ErrorLogsResponse> {
  const params = new URLSearchParams();
  
  if (filters.page !== undefined) params.append('page', String(filters.page));
  if (filters.size !== undefined) params.append('size', String(filters.size));
  if (filters.exceptionType) params.append('exceptionType', filters.exceptionType);
  if (filters.search) params.append('search', filters.search);
  
  const response = await http.get<ErrorLogsResponse>(`/api/logs/errors?${params.toString()}`);
  return response.data;
}

/**
 * Obtiene un log por ID
 */
export async function getLogById(id: number): Promise<AuditLog> {
  const response = await http.get<AuditLog>(`/api/logs/${id}`);
  return response.data;
}

/**
 * Obtiene un error por ID (incluye stack trace)
 */
export async function getErrorById(id: number): Promise<ErrorLog> {
  const response = await http.get<ErrorLog>(`/api/logs/errors/${id}`);
  return response.data;
}

/**
 * Obtiene los niveles disponibles
 */
export async function getLogLevels(): Promise<LogLevel[]> {
  const response = await http.get<LogLevel[]>('/api/logs/levels');
  return response.data;
}

/**
 * Obtiene las categorías disponibles
 */
export async function getLogCategories(): Promise<LogCategory[]> {
  const response = await http.get<LogCategory[]>('/api/logs/categories');
  return response.data;
}

/**
 * Obtiene los logs más recientes
 */
export async function getRecentLogs(): Promise<AuditLog[]> {
  const response = await http.get<AuditLog[]>('/api/logs/recent');
  return response.data;
}

/**
 * Obtiene estadísticas de logs
 */
export async function getLogStats(): Promise<LogStats> {
  const response = await http.get<LogStats>('/api/logs/stats');
  return response.data;
}
