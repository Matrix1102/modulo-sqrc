package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO con la respuesta completa de la generación de artículo con IA.
 * Incluye el artículo generado y metadatos del proceso.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerarArticuloIAResponse {

    /**
     * Indica si la generación fue exitosa.
     */
    private boolean exito;

    /**
     * Mensaje descriptivo del resultado.
     */
    private String mensaje;

    /**
     * El artículo creado (si fue exitoso).
     */
    private ArticuloResponse articulo;

    /**
     * Contenido generado por la IA (para preview antes de guardar).
     */
    private ArticuloGeneradoIA contenidoGenerado;

    /**
     * ID de la documentación origen.
     */
    private Long idDocumentacionOrigen;

    /**
     * ID del ticket asociado.
     */
    private Long idTicketOrigen;

    /**
     * Tiempo de procesamiento en milisegundos.
     */
    private Long tiempoProcesamiento;

    /**
     * Tokens utilizados por la IA.
     */
    private Integer tokensUtilizados;

    /**
     * Errores encontrados durante el proceso.
     */
    private List<String> errores;
}
