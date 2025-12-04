package com.sqrc.module.backendsqrc.ticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta cuando se crea documentación exitosamente.
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentacionCreatedResponse {

    private Long idDocumentacion;
    private Long ticketId;
    private String problema;
    private String solucion;
    private Integer articuloKBId;
    private String nombreEmpleado;
    private LocalDateTime fechaCreacion;
    private String mensaje;
}
