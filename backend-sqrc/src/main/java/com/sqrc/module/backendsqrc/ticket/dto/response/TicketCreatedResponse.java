package com.sqrc.module.backendsqrc.ticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta cuando se crea un ticket exitosamente.
 * 
 * Patrón: DTO (Data Transfer Object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreatedResponse {

    private Long idTicket;
    private String asunto;
    private String tipoTicket;
    private String estado;
    private String origen;
    private LocalDateTime fechaCreacion;
    private Integer clienteId;
    private String nombreCliente;
    private Long empleadoAsignadoId;
    private String nombreEmpleadoAsignado;
    private String mensaje;
}
