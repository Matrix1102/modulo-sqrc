import http from '../../../services/http';
import type { Encuesta } from '../types/encuesta';

const BASE = '/api/encuestas';

export const encuestaService = {
  list: (params?: Record<string, any>): Promise<Encuesta[]> =>
    http.get(BASE, { params }).then((r) => r.data),

  getById: (id: number): Promise<Encuesta> => http.get(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: Partial<Encuesta>): Promise<Encuesta> => http.post(BASE, payload).then((r) => r.data),

  update: (id: number, payload: Partial<Encuesta>): Promise<Encuesta> =>
    http.put(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: number): Promise<void> => http.delete(`${BASE}/${id}`).then(() => undefined),
};

export default encuestaService;
