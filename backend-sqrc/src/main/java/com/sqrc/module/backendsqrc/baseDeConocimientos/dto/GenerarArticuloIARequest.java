package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitar la generación de un artículo usando IA (Gemini).
 * Puede usarse con documentación de ticket o para generar un artículo de ejemplo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerarArticuloIARequest {

    /**
     * ID de documentación de ticket (opcional).
     * Si se proporciona, genera desde la documentación.
     * Si es null, genera un artículo de ejemplo/demo.
     */
    private Long idDocumentacion;

    /**
     * ID del empleado que solicita la generación.
     */
    private Long idCreador;

    /**
     * Instrucciones adicionales opcionales para la IA.
     * Ejemplo: "Enfocarse en el proceso de solución", "Hacerlo más técnico"
     */
    private String instruccionesAdicionales;
    
    /**
     * Tema sugerido para el artículo (usado cuando no hay documentación).
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
}
