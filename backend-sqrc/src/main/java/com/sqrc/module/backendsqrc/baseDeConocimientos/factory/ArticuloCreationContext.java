package com.sqrc.module.backendsqrc.baseDeConocimientos.factory;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.GeneracionArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;

import lombok.Builder;
import lombok.Getter;

/**
 * Contexto de creación para el Factory Pattern.
 * 
 * <p>
 * Encapsula todos los datos necesarios para crear un artículo,
 * permitiendo una API limpia y extensible para el factory.
 * </p>
 * 
 * <p>
 * Usa el patrón Builder para una construcción fluida y legible.
 * </p>
 * 
 * @see ArticuloFactory
 * @see ArticuloFactoryImpl
 */
@Getter
@Builder
public class ArticuloCreationContext {

    /**
     * Contenido del artículo generado por IA.
     */
    private final ArticuloGeneradoIA contenidoGenerado;

    /**
     * Empleado que está creando el artículo.
     */
    private final Empleado creador;

    /**
     * Tipo de fuente del artículo (DOCUMENTACION, DOCUMENTO_UPLOAD, TEMA_LIBRE).
     */
    private final GeneracionArticuloRequest.TipoFuente tipoFuente;

    /**
     * Origen de la versión del artículo.
     */
    private final OrigenVersion origenVersion;

    /**
     * Nota de cambio para la versión inicial.
     */
    private final String notaCambio;

    /**
     * Ticket de origen (si aplica).
     */
    private final Ticket ticketOrigen;

    /**
     * ID de la documentación de origen (si aplica).
     */
    private final Long idDocumentacion;

    /**
     * Nombre del documento subido (si aplica).
     */
    private final String nombreDocumento;

    /**
     * Tema libre especificado (si aplica).
     */
    private final String tema;

    /**
     * Request original de generación (opcional, para acceso a datos adicionales).
     */
    private final GeneracionArticuloRequest requestOriginal;

    // ===================== FACTORY METHODS =====================

    /**
     * Crea un contexto para artículo generado desde documentación de ticket.
     */
    public static ArticuloCreationContext desdeDocumentacion(
            ArticuloGeneradoIA contenido,
            Empleado creador,
            Long idDocumentacion,
            Ticket ticketOrigen) {
        return ArticuloCreationContext.builder()
                .contenidoGenerado(contenido)
                .creador(creador)
                .tipoFuente(GeneracionArticuloRequest.TipoFuente.DOCUMENTACION)
                .origenVersion(OrigenVersion.DERIVADO_DE_DOCUMENTACION)
                .idDocumentacion(idDocumentacion)
                .ticketOrigen(ticketOrigen)
                .notaCambio("Artículo generado con IA desde documentación de ticket")
                .build();
    }

    /**
     * Crea un contexto para artículo generado desde documento subido.
     */
    public static ArticuloCreationContext desdeDocumentoUpload(
            ArticuloGeneradoIA contenido,
            Empleado creador,
            String nombreDocumento) {
        return ArticuloCreationContext.builder()
                .contenidoGenerado(contenido)
                .creador(creador)
                .tipoFuente(GeneracionArticuloRequest.TipoFuente.DOCUMENTO_UPLOAD)
                .origenVersion(OrigenVersion.DOCUMENTO_SUBIDO)
                .nombreDocumento(nombreDocumento)
                .notaCambio("Artículo generado con IA desde documento: " +
                        (nombreDocumento != null ? nombreDocumento : "documento"))
                .build();
    }

    /**
     * Crea un contexto para artículo generado desde tema libre.
     */
    public static ArticuloCreationContext desdeTemaLibre(
            ArticuloGeneradoIA contenido,
            Empleado creador,
            String tema) {
        return ArticuloCreationContext.builder()
                .contenidoGenerado(contenido)
                .creador(creador)
                .tipoFuente(GeneracionArticuloRequest.TipoFuente.TEMA_LIBRE)
                .origenVersion(OrigenVersion.TEMA_LIBRE)
                .tema(tema)
                .notaCambio("Artículo generado con IA sobre tema: " +
                        (tema != null ? tema : "tema libre"))
                .build();
    }

    /**
     * Crea un contexto desde un GeneracionArticuloRequest existente.
     */
    public static ArticuloCreationContext desdeRequest(
            ArticuloGeneradoIA contenido,
            Empleado creador,
            GeneracionArticuloRequest request) {
        return ArticuloCreationContext.builder()
                .contenidoGenerado(contenido)
                .creador(creador)
                .tipoFuente(request.getTipoFuente())
                .origenVersion(determinarOrigen(request.getTipoFuente()))
                .idDocumentacion(request.getIdDocumentacion())
                .nombreDocumento(request.getNombreDocumento())
                .tema(request.getTema())
                .notaCambio(generarNotaCambio(contenido, request))
                .requestOriginal(request)
                .build();
    }

    // ===================== HELPERS =====================

    private static OrigenVersion determinarOrigen(GeneracionArticuloRequest.TipoFuente tipoFuente) {
        if (tipoFuente == null) {
            return OrigenVersion.MANUAL;
        }
        return switch (tipoFuente) {
            case DOCUMENTACION -> OrigenVersion.DERIVADO_DE_DOCUMENTACION;
            case DOCUMENTO_UPLOAD -> OrigenVersion.DOCUMENTO_SUBIDO;
            case TEMA_LIBRE -> OrigenVersion.TEMA_LIBRE;
        };
    }

    private static String generarNotaCambio(ArticuloGeneradoIA contenido, GeneracionArticuloRequest request) {
        if (contenido.getNotaCambio() != null && !contenido.getNotaCambio().isBlank()) {
            return contenido.getNotaCambio();
        }

        if (request.getTipoFuente() == null) {
            return "Artículo generado automáticamente con IA";
        }

        return switch (request.getTipoFuente()) {
            case DOCUMENTACION -> "Artículo generado con IA desde documentación de ticket";
            case DOCUMENTO_UPLOAD -> "Artículo generado con IA desde documento: " +
                    (request.getNombreDocumento() != null ? request.getNombreDocumento() : "documento");
            case TEMA_LIBRE -> "Artículo generado con IA sobre tema: " +
                    (request.getTema() != null ? request.getTema() : "tema libre");
        };
    }
}
