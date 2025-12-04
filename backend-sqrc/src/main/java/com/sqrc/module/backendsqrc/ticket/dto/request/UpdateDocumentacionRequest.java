package com.sqrc.module.backendsqrc.ticket.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar documentación existente de un ticket.
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDocumentacionRequest {

    /**
     * Descripción actualizada del problema del cliente
     */
    private String problema;

    /**
     * ID del artículo de la Base de Conocimiento utilizado
     */
    private Integer articuloKBId;

    /**
     * Descripción actualizada de la solución aplicada
     */
    private String solucion;
}
