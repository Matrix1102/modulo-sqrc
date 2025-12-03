package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para filtros de búsqueda de tickets
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketFilterDTO {
    
    private String term; // término de búsqueda libre
    private LocalDateTime dateStart; // fecha inicio del rango
    private LocalDateTime dateEnd; // fecha fin del rango
    private String[] status; // array de estados a filtrar
    private String type; // tipo de ticket a filtrar
    private String channel; // canal/origen a filtrar
    private Long clienteId; // ID del cliente (para filtrar por cliente específico)
}
