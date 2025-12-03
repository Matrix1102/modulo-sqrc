package com.sqrc.module.backendsqrc.ticket.dto;

import com.sqrc.module.backendsqrc.ticket.model.EstadoLlamada;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para representar una llamada.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlamadaDto {

    private Long idLlamada;
    private LocalDateTime fechaHora;
    private Integer duracionSegundos;
    private String duracionFormateada;
    private String numeroOrigen;
    private EstadoLlamada estado;
    private Long ticketId;
    private Long empleadoId;
    private String nombreEmpleado;
}
