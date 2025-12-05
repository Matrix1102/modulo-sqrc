package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO unificado para solicitar la generación de artículos con IA.
 * Soporta múltiples fuentes de datos según el patrón Strategy.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneracionArticuloRequest {

    /**
     * Tipo de fuente para la generación.
     */
    public enum TipoFuente {
        DOCUMENTACION, // Desde documentación de ticket existente
        DOCUMENTO_UPLOAD, // Desde documento subido (PDF, Word, etc.)
        TEMA_LIBRE // Desde un tema especificado por el usuario
    }

    /**
     * Tipo de fuente de datos para la generación.
     */
    private TipoFuente tipoFuente;

    /**
     * ID del empleado que solicita la generación.
     */
    private Long idCreador;

    // ========== Campos para DOCUMENTACION ==========

    /**
     * ID de documentación de ticket (solo para tipoFuente=DOCUMENTACION).
     */
    private Long idDocumentacion;

    // ========== Campos para DOCUMENTO_UPLOAD ==========

    /**
     * Archivo subido (PDF, Word, etc.) - solo para tipoFuente=DOCUMENTO_UPLOAD.
     * Nota: En la práctica, este campo se maneja por separado en el controlador.
     */
    private transient MultipartFile documento;

    /**
     * Contenido extraído del documento (usado internamente después de procesar).
     */
    private String contenidoDocumento;

    /**
     * Nombre original del archivo subido.
     */
    private String nombreDocumento;

    /**
     * Tipo MIME del documento (application/pdf, application/msword, etc.).
     */
    private String tipoDocumento;

    // ========== Campos para TEMA_LIBRE ==========

    /**
     * Tema sugerido para el artículo (solo para tipoFuente=TEMA_LIBRE).
     */
    private String tema;

    /**
     * Etiqueta sugerida para el artículo.
     */
    private String etiquetaSugerida;

    /**
     * Tipo de caso sugerido.
     */
    private String tipoCasoSugerido;

    // ========== Métodos de utilidad ==========

    /**
     * Verifica si la solicitud es para generación desde documentación.
     */
    public boolean esDesdeDocumentacion() {
        return tipoFuente == TipoFuente.DOCUMENTACION && idDocumentacion != null;
    }

    /**
     * Verifica si la solicitud es para generación desde documento subido.
     */
    public boolean esDesdeDocumentoUpload() {
        return tipoFuente == TipoFuente.DOCUMENTO_UPLOAD &&
                (documento != null || contenidoDocumento != null);
    }

    /**
     * Verifica si la solicitud es para generación desde tema libre.
     */
    public boolean esDesdeTemaLibre() {
        return tipoFuente == TipoFuente.TEMA_LIBRE && tema != null && !tema.isBlank();
    }

    /**
     * Crea una solicitud desde documentación existente.
     */
    public static GeneracionArticuloRequest desdeDocumentacion(Long idDocumentacion, Long idCreador) {
        return GeneracionArticuloRequest.builder()
                .tipoFuente(TipoFuente.DOCUMENTACION)
                .idDocumentacion(idDocumentacion)
                .idCreador(idCreador)
                .build();
    }

    /**
     * Crea una solicitud desde documento subido.
     */
    public static GeneracionArticuloRequest desdeDocumentoUpload(String contenido, String nombreArchivo,
            String tipoMime, Long idCreador) {
        return GeneracionArticuloRequest.builder()
                .tipoFuente(TipoFuente.DOCUMENTO_UPLOAD)
                .contenidoDocumento(contenido)
                .nombreDocumento(nombreArchivo)
                .tipoDocumento(tipoMime)
                .idCreador(idCreador)
                .build();
    }

    /**
     * Crea una solicitud desde tema libre.
     */
    public static GeneracionArticuloRequest desdeTemaLibre(String tema, String etiqueta,
            String tipoCaso, Long idCreador) {
        return GeneracionArticuloRequest.builder()
                .tipoFuente(TipoFuente.TEMA_LIBRE)
                .tema(tema)
                .etiquetaSugerida(etiqueta)
                .tipoCasoSugerido(tipoCaso)
                .idCreador(idCreador)
                .build();
    }
}
