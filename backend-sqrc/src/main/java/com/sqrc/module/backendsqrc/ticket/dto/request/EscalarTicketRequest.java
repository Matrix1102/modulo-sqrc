package com.sqrc.module.backendsqrc.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para escalar un ticket del Agente al BackOffice.
 * 
 * Cuando un Agente escala un ticket:
 * 1. El estado cambia de ABIERTO a ESCALADO
 * 2. Se finaliza la asignación actual del Agente
 * 3. Se crea una nueva asignación al BackOffice
 * 4. Se registra el motivo de escalamiento
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalarTicketRequest {

    /**
     * ID del empleado Agente que está escalando el ticket
     */
    @NotNull(message = "El ID del agente es obligatorio")
    private Long agenteId;

    /**
     * ID del empleado BackOffice al que se escala
     */
    @NotNull(message = "El ID del BackOffice es obligatorio")
    private Long backofficeId;

    /**
     * Razón por la cual se escala el ticket
     */
    @NotBlank(message = "El motivo de escalamiento es obligatorio")
    private String motivoEscalamiento;

    /**
     * Documentación de la problemática antes de escalar (opcional)
     */
    private String problemaDocumentado;

    /**
     * ID del artículo de la Base de Conocimiento consultado (opcional)
     */
    private Integer articuloKBId;
}
