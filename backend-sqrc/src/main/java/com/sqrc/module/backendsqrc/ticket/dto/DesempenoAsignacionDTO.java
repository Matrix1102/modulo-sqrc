package com.sqrc.module.backendsqrc.ticket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para exponer datos de desempeño de asignaciones a otros módulos.
 * Contiene información de la asignación, ticket y detalles específicos según el tipo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesempenoAsignacionDTO {

    // === Datos de la Asignación ===
    
    @JsonProperty("id_asignacion")
    private Long idAsignacion;

    @JsonProperty("id_ticket")
    private Long idTicket;

    @JsonProperty("fecha_asignacion")
    private LocalDateTime fechaAsignacion;

    @JsonProperty("fecha_fin_asignacion")
    private LocalDateTime fechaFinAsignacion;

    // === Datos del Ticket ===
    
    @JsonProperty("estado_ticket")
    private String estadoTicket;

    @JsonProperty("categoria_ticket")
    private String categoriaTicket;

    @JsonProperty("asunto_ticket")
    private String asuntoTicket;

    // === Datos Específicos de Queja (null si no aplica) ===
    
    @JsonProperty("nivel_impacto")
    private String nivelImpacto;
}
