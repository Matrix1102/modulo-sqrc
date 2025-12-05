package com.sqrc.module.backendsqrc.ticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear documentación de un ticket.
 * 
 * La documentación contiene:
 * - Problema: Descripción detallada de la problemática del cliente
 * - Artículo KB: Referencia al artículo de Base de Conocimiento utilizado
 * - Solución: Descripción de la solución aplicada
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDocumentacionRequest {

    /**
     * ID del ticket al que pertenece la documentación.
     * Se establece automáticamente desde el path del endpoint, no necesita validación @NotNull.
     */
    private Long ticketId;

    /**
     * Descripción detallada del problema del cliente
     */
    private String problema;

    /**
     * ID del artículo de la Base de Conocimiento utilizado
     */
    private Integer articuloKBId;

    /**
     * Descripción de la solución aplicada
     */
    private String solucion;

    /**
     * ID del empleado que documenta
     */
    @NotNull(message = "El ID del empleado es obligatorio")
    private Long empleadoId;
}
