package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO específico para tickets de tipo RECLAMO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketReclamoDto {
    
    private String motivoReclamo;
    private LocalDate fechaLimiteRespuesta;
    private LocalDate fechaLimiteResolucion;
    private String resultado;
}
