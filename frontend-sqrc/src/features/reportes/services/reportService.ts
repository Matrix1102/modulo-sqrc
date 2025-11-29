import http from "../../../services/http";

import type { DashboardKpis } from "../types/reporte";

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

export default { fetchDashboard };
