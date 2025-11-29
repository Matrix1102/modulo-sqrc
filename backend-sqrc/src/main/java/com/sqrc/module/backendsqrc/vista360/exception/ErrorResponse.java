package com.sqrc.module.backendsqrc.vista360.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Estructura de respuesta de error estandarizada para las excepciones de la API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * Timestamp del momento en que ocurrió el error
     */
    private LocalDateTime timestamp;

    /**
     * Código de estado HTTP
     */
    private int status;

    /**
     * Nombre del error HTTP (ej: "Not Found", "Bad Request")
     */
    private String error;

    /**
     * Mensaje descriptivo del error
     */
    private String message;

    /**
     * Ruta de la petición que causó el error
     */
    private String path;

    /**
     * Detalles adicionales de validación (opcional)
     */
    private Map<String, String> validationErrors;
}
