import http from "../../../services/http";
import type {
  ArticuloResponse,
  ArticuloResumenResponse,
  ArticuloVersionResponse,
  BusquedaArticuloRequest,
  CrearArticuloRequest,
  ActualizarArticuloRequest,
  CrearVersionRequest,
  PublicarArticuloRequest,
  FeedbackRequest,
  FeedbackResponse,
  FeedbackEstadisticasResponse,
  PaginaResponse,
  Visibilidad,
} from "../types/articulo";

const BASE_URL = "/api/articulos";

/**
 * Servicio para la gestión de artículos de la Base de Conocimiento.
 */
const articuloService = {
  // ==================== ARTÍCULOS ====================

  /**
   * Crea un nuevo artículo con su versión inicial.
   */
  async crearArticulo(data: CrearArticuloRequest): Promise<ArticuloResponse> {
    const response = await http.post<ArticuloResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * Obtiene un artículo por su ID.
   */
  async obtenerPorId(id: number): Promise<ArticuloResponse> {
    const response = await http.get<ArticuloResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Obtiene un artículo por su código.
   */
  async obtenerPorCodigo(codigo: string): Promise<ArticuloResponse> {
    const response = await http.get<ArticuloResponse>(
      `${BASE_URL}/codigo/${codigo}`
    );
    return response.data;
  },

  /**
   * Actualiza un artículo existente.
   */
  async actualizarArticulo(
    id: number,
    data: ActualizarArticuloRequest
  ): Promise<ArticuloResponse> {
    const response = await http.put<ArticuloResponse>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Elimina un artículo.
   */
  async eliminarArticulo(id: number): Promise<void> {
    await http.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Busca artículos con filtros (POST).
   */
  async buscarArticulos(
    filtros: BusquedaArticuloRequest
  ): Promise<PaginaResponse<ArticuloResumenResponse>> {
    const response = await http.post<PaginaResponse<ArticuloResumenResponse>>(
      `${BASE_URL}/buscar`,
      filtros
    );
    return response.data;
  },

  /**
   * Busca artículos con filtros (GET simplificado).
   */
  async buscarArticulosGet(params: {
    texto?: string;
    etiqueta?: string;
    visibilidad?: string;
    tipoCaso?: string;
    pagina?: number;
    tamanio?: number;
  }): Promise<PaginaResponse<ArticuloResumenResponse>> {
    const response = await http.get<PaginaResponse<ArticuloResumenResponse>>(
      `${BASE_URL}/buscar`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtiene artículos publicados.
   */
  async obtenerPublicados(
    visibilidad?: Visibilidad
  ): Promise<ArticuloResumenResponse[]> {
    const params = visibilidad ? { visibilidad } : {};
    const response = await http.get<ArticuloResumenResponse[]>(
      `${BASE_URL}/publicados`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtiene los artículos del empleado (mis artículos).
   */
  async obtenerMisArticulos(
    idEmpleado: number
  ): Promise<ArticuloResumenResponse[]> {
    const response = await http.get<ArticuloResumenResponse[]>(
      `${BASE_URL}/mis-articulos/${idEmpleado}`
    );
    return response.data;
  },

  /**
   * Obtiene los borradores del empleado.
   */
  async obtenerMisBorradores(
    idEmpleado: number
  ): Promise<ArticuloResumenResponse[]> {
    const response = await http.get<ArticuloResumenResponse[]>(
      `${BASE_URL}/mis-borradores/${idEmpleado}`
    );
    return response.data;
  },

  /**
   * Obtiene artículos deprecados.
   */
  async obtenerDeprecados(): Promise<ArticuloResumenResponse[]> {
    const response = await http.get<ArticuloResumenResponse[]>(
      `${BASE_URL}/deprecados`
    );
    return response.data;
  },

  /**
   * Obtiene artículos más populares.
   */
  async obtenerPopulares(limite = 10): Promise<ArticuloResumenResponse[]> {
    const response = await http.get<ArticuloResumenResponse[]>(
      `${BASE_URL}/populares`,
      { params: { limite } }
    );
    return response.data;
  },

  /**
   * Genera un código único para nuevo artículo.
   */
  async generarCodigo(): Promise<string> {
    const response = await http.get<string>(`${BASE_URL}/generar-codigo`);
    return response.data;
  },

  // ==================== VERSIONES ====================

  /**
   * Crea una nueva versión de un artículo.
   */
  async crearVersion(
    idArticulo: number,
    data: CrearVersionRequest
  ): Promise<ArticuloVersionResponse> {
    const response = await http.post<ArticuloVersionResponse>(
      `${BASE_URL}/${idArticulo}/versiones`,
      data
    );
    return response.data;
  },

  /**
   * Obtiene todas las versiones de un artículo.
   */
  async obtenerVersiones(
    idArticulo: number
  ): Promise<ArticuloVersionResponse[]> {
    const response = await http.get<ArticuloVersionResponse[]>(
      `${BASE_URL}/${idArticulo}/versiones`
    );
    return response.data;
  },

  /**
   * Obtiene la versión vigente de un artículo.
   */
  async obtenerVersionVigente(
    idArticulo: number
  ): Promise<ArticuloVersionResponse> {
    const response = await http.get<ArticuloVersionResponse>(
      `${BASE_URL}/${idArticulo}/version-vigente`
    );
    return response.data;
  },

  /**
   * Marca una versión como vigente.
   */
  async marcarComoVigente(
    idArticulo: number,
    idVersion: number
  ): Promise<ArticuloVersionResponse> {
    const response = await http.put<ArticuloVersionResponse>(
      `${BASE_URL}/${idArticulo}/versiones/${idVersion}/vigente`
    );
    return response.data;
  },

  /**
   * Publica un artículo con una versión específica.
   */
  async publicarArticulo(
    idArticulo: number,
    idVersion: number,
    data: PublicarArticuloRequest
  ): Promise<ArticuloVersionResponse> {
    const response = await http.post<ArticuloVersionResponse>(
      `${BASE_URL}/${idArticulo}/publicacion`,
      data,
      { params: { idVersion } }
    );
    return response.data;
  },

  /**
   * Archiva una versión.
   */
  async archivarVersion(
    idArticulo: number,
    idVersion: number
  ): Promise<ArticuloVersionResponse> {
    const response = await http.put<ArticuloVersionResponse>(
      `${BASE_URL}/${idArticulo}/versiones/${idVersion}/archivar`
    );
    return response.data;
  },

  /**
   * Rechaza una versión propuesta.
   */
  async rechazarVersion(
    idArticulo: number,
    idVersion: number
  ): Promise<ArticuloVersionResponse> {
    const response = await http.put<ArticuloVersionResponse>(
      `${BASE_URL}/${idArticulo}/versiones/${idVersion}/rechazar`
    );
    return response.data;
  },

  // ==================== FEEDBACK ====================

  /**
   * Registra feedback para una versión.
   */
  async registrarFeedback(data: FeedbackRequest): Promise<FeedbackResponse> {
    const response = await http.post<FeedbackResponse>(
      `${BASE_URL}/feedback`,
      data
    );
    return response.data;
  },

  /**
   * Registra feedback rápido (útil/no útil).
   */
  async feedbackRapido(
    idArticulo: number,
    idVersion: number,
    idEmpleado: number,
    util: boolean
  ): Promise<FeedbackResponse> {
    const response = await http.post<FeedbackResponse>(
      `${BASE_URL}/${idArticulo}/versiones/${idVersion}/feedback-rapido`,
      null,
      { params: { idEmpleado, util } }
    );
    return response.data;
  },

  /**
   * Obtiene feedbacks de una versión.
   */
  async obtenerFeedbacksVersion(
    idArticulo: number,
    idVersion: number
  ): Promise<FeedbackResponse[]> {
    const response = await http.get<FeedbackResponse[]>(
      `${BASE_URL}/${idArticulo}/versiones/${idVersion}/feedbacks`
    );
    return response.data;
  },

  /**
   * Obtiene estadísticas de feedback de una versión.
   */
  async obtenerEstadisticasFeedback(
    idArticulo: number,
    idVersion: number
  ): Promise<FeedbackEstadisticasResponse> {
    const response = await http.get<FeedbackEstadisticasResponse>(
      `${BASE_URL}/${idArticulo}/versiones/${idVersion}/estadisticas`
    );
    return response.data;
  },

  /**
   * Obtiene feedbacks de un artículo paginado.
   */
  async obtenerFeedbacksArticulo(
    idArticulo: number,
    pagina = 0,
    tamanio = 10
  ): Promise<PaginaResponse<FeedbackResponse>> {
    const response = await http.get<PaginaResponse<FeedbackResponse>>(
      `${BASE_URL}/${idArticulo}/feedbacks`,
      { params: { pagina, tamanio } }
    );
    return response.data;
  },

  /**
   * Elimina un feedback.
   */
  async eliminarFeedback(
    idFeedback: number,
    idEmpleado: number
  ): Promise<void> {
    await http.delete(`${BASE_URL}/feedback/${idFeedback}`, {
      params: { idEmpleado },
    });
  },
};

export default articuloService;
