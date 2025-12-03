package com.sqrc.module.backendsqrc.ticket.dto.request;

import com.sqrc.module.backendsqrc.ticket.model.OrigenTicket;
import com.sqrc.module.backendsqrc.ticket.model.TipoTicket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO base para crear tickets.
 * Utiliza el patrón DTO para transferir datos entre la capa de presentación y la de negocio.
 * 
 * Los campos específicos de cada tipo de ticket (Consulta, Queja, Reclamo, Solicitud)
 * se manejan en sus respectivos DTOs que extienden o complementan este.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    @NotBlank(message = "El asunto es obligatorio")
    @Size(max = 100, message = "El asunto no puede exceder 100 caracteres")
    private String asunto;

    @Size(max = 300, message = "La descripción no puede exceder 300 caracteres")
    private String descripcion;

    @NotNull(message = "El tipo de ticket es obligatorio")
    private TipoTicket tipoTicket;

    @NotNull(message = "El origen es obligatorio")
    private OrigenTicket origen;

    @NotNull(message = "El ID del cliente es obligatorio")
    private Integer clienteId;

    private Long motivoId;

    @NotNull(message = "El ID del empleado asignado es obligatorio")
    private Long empleadoId;

    // Campos específicos por tipo - se llenan según el tipoTicket seleccionado
    
    // Para CONSULTA
    private String tema;

    // Para QUEJA
    private String impacto;
    private String areaInvolucrada;

    // Para RECLAMO
    private String motivoReclamo;

    // Para SOLICITUD
    private String tipoSolicitud;

    // ID de llamada asociada (opcional, si el origen es LLAMADA)
    private Long llamadaId;
}
