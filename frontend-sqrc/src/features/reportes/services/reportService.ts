import http from "../../../services/http";

import type { DashboardKpis } from "../types/reporte";
import type { AgenteDetail, AgentTickets, SurveyDashboard } from "../types/reporte";

export const fetchDashboard = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const query: Record<string, string> = {};
  if (params?.startDate) query.startDate = params.startDate;
  if (params?.endDate) query.endDate = params.endDate;

  const resp = await http.get<DashboardKpis>("/api/reportes/dashboard", {
    params: query,
  });
  return resp.data;
};

export const fetchAgentes = async (params?: { startDate?: string; endDate?: string }) => {
  const query: Record<string, string> = {};
  if (params?.startDate) query.startDate = params.startDate;
  if (params?.endDate) query.endDate = params.endDate;

  const resp = await http.get<AgenteDetail[]>('/api/reportes/agentes', { params: query });
  return resp.data;
};

export const fetchTicketsByAgent = async (agenteId: string, params?: { startDate?: string; endDate?: string }) => {
  const query: Record<string, string> = {};
  if (params?.startDate) query.startDate = params.startDate;
  if (params?.endDate) query.endDate = params.endDate;

  const resp = await http.get<AgentTickets>(`/api/reportes/tickets/agente/${encodeURIComponent(agenteId)}`, { params: query });
  return resp.data;
};

export const fetchSurveyKpis = async (params?: { startDate?: string; endDate?: string }) => {
  const query: Record<string, string> = {};
  if (params?.startDate) query.startDate = params.startDate;
  if (params?.endDate) query.endDate = params.endDate;

  const resp = await http.get<SurveyDashboard>("/api/reportes/encuestas", { params: query });
  return resp.data;
};

export const fetchEncuestaRespuestas = async (params?: {
  alcanceEvaluacion?: string;
  agenteId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  size?: number;
}) => {
  const query: Record<string, any> = {};
  if (params?.alcanceEvaluacion) query.alcanceEvaluacion = params.alcanceEvaluacion;
  if (params?.agenteId) query.agenteId = params.agenteId;
  if (params?.startDate) query.startDate = params.startDate;
  if (params?.endDate) query.endDate = params.endDate;
  if (params?.limit) query.limit = params.limit;
  if (params?.page !== undefined) query.page = params.page;
  if (params?.size !== undefined) query.size = params.size;

  const resp = await http.get<any[]>('/api/encuestas/respuestas', { params: query });
  return resp.data;
};

export default { fetchDashboard, fetchAgentes, fetchTicketsByAgent, fetchSurveyKpis, fetchEncuestaRespuestas };
