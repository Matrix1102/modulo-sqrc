package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO principal del historial completo del ticket
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryResponse {
    
    private Long idTicket;
    private Integer clienteId;
    private String titulo;
    private String motivo;
    private String descripcion;
    private String estado;
    private String origen;
    private String tipoTicket;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCierre;
    private List<AssignmentDto> asignaciones;
    
    // Campos específicos por tipo de ticket (solo uno estará poblado)
    private TicketConsultaDto consultaInfo;
    private TicketQuejaDto quejaInfo;
    private TicketSolicitudDto solicitudInfo;
    private TicketReclamoDto reclamoInfo;
}
