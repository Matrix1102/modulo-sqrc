export const TipoCaso = {
    RECLAMO: 'RECLAMO',
    QUEJA: 'QUEJA',
    SOLICITUD: 'SOLICITUD',
    CONSULTA: 'CONSULTA'
} as const;

export type TipoCaso = typeof TipoCaso[keyof typeof TipoCaso];

export interface PlantillaResumen {
    id: number;
    nombre: string;
    categoria: string;
    activa: boolean;
    creada: string;
    modificada: string;
}

export interface PlantillaDetalle {
    id: number;
    nombreInterno: string;
    tituloVisible: string;
    categoria: string;
    cuerpo: string;
    despedida: string;
    htmlModel: string;
}

export interface CrearPlantillaRequest {
    nombreInterno: string;
    tituloVisible: string;
    tipoCaso: string;
    htmlModelo?: string;
    cuerpo: string;
    despedida: string;
}

export interface ActualizarPlantillaRequest {
    nombreInterno: string;
    tituloVisible: string;
    tipoCaso: string;
    htmlModelo?: string;
    cuerpo: string;
    despedida: string;
    activo: boolean;
}
// DTOs para el flujo de RESPUESTAS
export interface RespuestaBorradorDTO {
    titulo: string;
    cuerpo: string;
    despedida: string;
    htmlPreview: string;
}

export interface PreviewResponseDTO {
    idPlantilla: number;
    titulo: string;
    htmlRenderizado: string;
}

export interface EnviarRespuestaRequest {
    idAsignacion: number;
    idPlantilla: number;
    correoDestino: string;
    asunto: string;
    variables: Record<string, any>; // { cuerpo: "..." }
    cerrarTicket: boolean;
}

export interface RespuestaHistorialDTO {
    idRespuesta: number;
    fechaEnvio: string; // Viene como String ISO desde Java
    idCliente: number;
    dniCliente: string;
    nombreCliente: string;
    tipoRespuesta: 'MANUAL' | 'AUTOMATICA';
    asunto: string;
    urlPdf: string;
}