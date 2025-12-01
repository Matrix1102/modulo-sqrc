// Tipos para la Base de Conocimiento

export type Etiqueta =
  | "GUIAS"
  | "POLITICAS"
  | "FAQS"
  | "CASOS"
  | "TROUBLESHOOTING"
  | "DESCRIPCIONES"
  | "INSTRUCTIVOS";

export type TipoCaso = "SOLICITUD" | "QUEJA" | "RECLAMO" | "CONSULTA" | "TODOS";

export type Visibilidad = "AGENTE" | "SUPERVISOR";

export type EstadoArticulo =
  | "PROPUESTO"
  | "BORRADOR"
  | "PUBLICADO"
  | "DEPRECADO"
  | "ARCHIVADO"
  | "RECHAZADO";

export type OrigenVersion = "MANUAL" | "DERIVADO_DE_DOCUMENTACION";

// ============ REQUEST DTOs ============

export interface CrearArticuloRequest {
  codigo: string;
  titulo: string;
  resumen?: string;
  etiqueta: Etiqueta;
  tipoCaso?: TipoCaso;
  visibilidad: Visibilidad;
  vigenteDesde?: string;
  vigenteHasta?: string;
  idPropietario: number;
  tags?: string;
  contenidoInicial: string;
  notaCambioInicial?: string;
}

export interface ActualizarArticuloRequest {
  titulo?: string;
  resumen?: string;
  etiqueta?: Etiqueta;
  tipoCaso?: TipoCaso;
  visibilidad?: Visibilidad;
  vigenteDesde?: string;
  vigenteHasta?: string;
  idUltimoEditor?: number;
}

export interface CrearVersionRequest {
  contenido: string;
  notaCambio?: string;
  idCreador: number;
  origen?: OrigenVersion;
  idTicketOrigen?: number;
}

export interface PublicarArticuloRequest {
  visibilidad: Visibilidad;
  vigenteDesde?: string;
  vigenteHasta?: string;
}

export interface FeedbackRequest {
  idVersion: number;
  idEmpleado: number;
  comentario?: string;
  calificacion?: number;
  util: boolean;
}

export interface BusquedaArticuloRequest {
  texto?: string;
  etiqueta?: Etiqueta;
  visibilidad?: Visibilidad;
  tipoCaso?: TipoCaso;
  idPropietario?: number;
  soloVigentes?: boolean;
  soloPublicados?: boolean;
  ordenarPor?: string;
  direccion?: "ASC" | "DESC";
  pagina?: number;
  tamanoPagina?: number;
}

// ============ RESPONSE DTOs ============

export interface ArticuloResponse {
  idArticulo: number;
  codigo: string;
  titulo: string;
  resumen?: string;
  etiqueta: Etiqueta;
  tipoCaso?: TipoCaso;
  visibilidad: Visibilidad;
  vigenteDesde?: string;
  vigenteHasta?: string;
  tags?: string;
  creadoEn: string;
  actualizadoEn?: string;
  idPropietario: number;
  nombrePropietario: string;
  idUltimoEditor?: number;
  nombreUltimoEditor?: string;
  versionVigente?: number;
  estadoVersionVigente?: EstadoArticulo;
  contenidoVersionVigente?: string;
  totalVersiones: number;
  feedbacksPositivos: number;
  calificacionPromedio: number;
  estaVigente: boolean;
}

export interface ArticuloResumenResponse {
  idArticulo: number;
  codigo: string;
  titulo: string;
  resumen?: string;
  etiqueta: Etiqueta;
  tipoCaso?: TipoCaso;
  visibilidad: Visibilidad;
  tags?: string;
  nombrePropietario: string;
  fechaModificacion: string;
  versionActual: number;
  feedbacksPositivos: number;
  vistas: number;
  estaVigente: boolean;
  estado: string;
}

export interface ArticuloVersionResponse {
  idArticuloVersion: number;
  idArticulo: number;
  codigoArticulo: string;
  tituloArticulo: string;
  numeroVersion: number;
  contenido: string;
  notaCambio?: string;
  creadoEn: string;
  esVigente: boolean;
  estadoPropuesta: EstadoArticulo;
  origen: OrigenVersion;
  idCreador: number;
  nombreCreador: string;
  idTicketOrigen?: number;
  feedbacksPositivos: number;
  feedbacksNegativos: number;
  calificacionPromedio: number;
  totalFeedbacks: number;
}

export interface FeedbackResponse {
  idFeedback: number;
  idVersion: number;
  numeroVersion: number;
  idArticulo: number;
  tituloArticulo: string;
  idEmpleado: number;
  nombreEmpleado: string;
  comentario?: string;
  calificacion?: number;
  util: boolean;
  creadoEn: string;
}

export interface FeedbackEstadisticasResponse {
  idVersion: number;
  feedbacksPositivos: number;
  feedbacksNegativos: number;
  totalFeedbacks: number;
  calificacionPromedio: number;
}

export interface PaginaResponse<T> {
  contenido: T[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanoPagina: number;
  esPrimera: boolean;
  esUltima: boolean;
  tieneAnterior: boolean;
  tieneSiguiente: boolean;
}

// ============ UTILIDADES ============

export const ETIQUETA_LABELS: Record<Etiqueta, string> = {
  GUIAS: "Guías",
  POLITICAS: "Políticas",
  FAQS: "FAQs",
  CASOS: "Casos",
  TROUBLESHOOTING: "Troubleshooting",
  DESCRIPCIONES: "Descripciones",
  INSTRUCTIVOS: "Instructivos",
};

export const TIPO_CASO_LABELS: Record<TipoCaso, string> = {
  SOLICITUD: "Solicitud",
  QUEJA: "Queja",
  RECLAMO: "Reclamo",
  CONSULTA: "Consulta",
  TODOS: "Todos",
};

export const VISIBILIDAD_LABELS: Record<Visibilidad, string> = {
  AGENTE: "Agente",
  SUPERVISOR: "Supervisor",
};

export const ESTADO_LABELS: Record<EstadoArticulo, string> = {
  PROPUESTO: "Propuesto",
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  DEPRECADO: "Deprecado",
  ARCHIVADO: "Archivado",
  RECHAZADO: "Rechazado",
};

export const ETIQUETA_OPTIONS = Object.entries(ETIQUETA_LABELS).map(
  ([value, label]) => ({
    value: value as Etiqueta,
    label,
  })
);

export const TIPO_CASO_OPTIONS = Object.entries(TIPO_CASO_LABELS).map(
  ([value, label]) => ({
    value: value as TipoCaso,
    label,
  })
);

export const VISIBILIDAD_OPTIONS = Object.entries(VISIBILIDAD_LABELS).map(
  ([value, label]) => ({
    value: value as Visibilidad,
    label,
  })
);

// Configuración visual de etiquetas
export const ETIQUETA_CONFIG: Record<
  Etiqueta,
  { label: string; color: string; icon: string }
> = {
  GUIAS: { label: "Guías", color: "#3B82F6", icon: "📘" },
  POLITICAS: { label: "Políticas", color: "#8B5CF6", icon: "📋" },
  FAQS: { label: "FAQs", color: "#10B981", icon: "❓" },
  CASOS: { label: "Casos", color: "#F59E0B", icon: "📁" },
  TROUBLESHOOTING: { label: "Troubleshooting", color: "#EF4444", icon: "🔧" },
  DESCRIPCIONES: { label: "Descripciones", color: "#6366F1", icon: "📝" },
  INSTRUCTIVOS: { label: "Instructivos", color: "#14B8A6", icon: "📖" },
};

// Tipo para resumen de artículos en columnas
export interface ArticuloResumen {
  id: number;
  codigo: string;
  titulo: string;
  resumen?: string;
  etiqueta: Etiqueta;
  tipoCaso?: TipoCaso;
  visibilidad: Visibilidad;
  estado: EstadoArticulo;
  nombrePropietario: string;
  actualizadoEn: string;
  versionActual: number;
  feedbacksPositivos: number;
}

// Función para mapear ArticuloResumenResponse a ArticuloResumen
export const mapToArticuloResumen = (
  response: ArticuloResumenResponse
): ArticuloResumen => ({
  id: response.idArticulo,
  codigo: response.codigo,
  titulo: response.titulo,
  resumen: response.resumen,
  etiqueta: response.etiqueta,
  tipoCaso: response.tipoCaso,
  visibilidad: response.visibilidad,
  estado: (response.estado as EstadoArticulo) || "BORRADOR",
  nombrePropietario: response.nombrePropietario,
  actualizadoEn: response.fechaModificacion,
  versionActual: response.versionActual,
  feedbacksPositivos: response.feedbacksPositivos,
});
