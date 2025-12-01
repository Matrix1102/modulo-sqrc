package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO específico para tickets de tipo QUEJA
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketQuejaDto {
    
    private String impacto;
    private String areaInvolucrada;
}
