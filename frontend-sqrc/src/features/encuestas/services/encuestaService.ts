import http from '../../../services/http';
import type { Encuesta } from '../types/encuesta';

const BASE = '/api/encuestas';
// Plantillas de encuestas están expuestas bajo el controller de encuestas
const PLANTILLAS_BASE = `${BASE}/plantillas`;

export const encuestaService = {
  list: (params?: Record<string, any>): Promise<Encuesta[]> =>
    http.get(BASE, { params }).then((r) => r.data),

  getById: (id: number): Promise<Encuesta> => http.get(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: Partial<Encuesta>): Promise<Encuesta> => http.post(BASE, payload).then((r) => r.data),

  update: (id: number, payload: Partial<Encuesta>): Promise<Encuesta> =>
    http.put(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: number): Promise<void> => http.delete(`${BASE}/${id}`).then(() => undefined),

  // --- Plantillas endpoints (crear / listar / actualizar / eliminar lógico / reactivar)
  plantillasList: (): Promise<any[]> => http.get(`${PLANTILLAS_BASE}`).then((r) => r.data),
  plantillaGet: (id: number): Promise<any> => http.get(`${PLANTILLAS_BASE}/${id}`).then((r) => r.data),
  plantillaCreate: (payload: any): Promise<any> => http.post(`${PLANTILLAS_BASE}`, payload).then((r) => r.data),
  plantillaUpdate: (id: number, payload: any): Promise<any> => http.put(`${PLANTILLAS_BASE}/${id}`, payload).then((r) => r.data),
  plantillaDelete: (id: number): Promise<void> => http.delete(`${PLANTILLAS_BASE}/${id}`).then(() => undefined),
  plantillaReactivate: (id: number): Promise<any> => http.post(`${PLANTILLAS_BASE}/${id}/reactivar`).then((r) => r.data),
};

export default encuestaService;
