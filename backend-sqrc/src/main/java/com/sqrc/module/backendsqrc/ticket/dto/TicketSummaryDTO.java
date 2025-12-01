package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para el resumen de ticket mostrado en la lista
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryDTO {
    
    private Long id;
    private String reasonTitle; // nombre del motivo
    private String status; // estado del ticket
    private LocalDateTime relevantDate; // fecha más relevante (cierre > atención > creación)
    private String priority; // prioridad calculada o configurada
}
