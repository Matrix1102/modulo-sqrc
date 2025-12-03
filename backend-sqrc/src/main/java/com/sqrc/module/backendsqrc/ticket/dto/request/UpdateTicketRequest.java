package com.sqrc.module.backendsqrc.ticket.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar información de un ticket existente.
 * Solo permite modificar campos editables según las reglas de negocio.
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketRequest {

    @Size(max = 100, message = "El asunto no puede exceder 100 caracteres")
    private String asunto;

    @Size(max = 300, message = "La descripción no puede exceder 300 caracteres")
    private String descripcion;

    private Long motivoId;

    // Campos específicos por tipo (se actualizan según el tipo del ticket)
    
    // Para CONSULTA
    private String tema;

    // Para QUEJA
    private String impacto;
    private String areaInvolucrada;

    // Para RECLAMO
    private String motivoReclamo;
    private String resultado;

    // Para SOLICITUD
    private String tipoSolicitud;
}
