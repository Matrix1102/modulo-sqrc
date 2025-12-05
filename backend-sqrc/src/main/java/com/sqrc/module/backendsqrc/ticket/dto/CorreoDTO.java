package com.sqrc.module.backendsqrc.ticket.dto;

import com.sqrc.module.backendsqrc.ticket.model.TipoCorreo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para representar un correo enviado en el contexto de un ticket.
 * Incluye información sobre la asignación asociada y el empleado responsable.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorreoDTO {

    private Long idCorreo;
    private String asunto;
    private String cuerpo;
    private LocalDateTime fechaEnvio;
    private TipoCorreo tipoCorreo;

    // Información de la asignación relacionada
    private Long idAsignacion;
    private Long ticketId;

    // Información del empleado (destinatario)
    private Long empleadoId;
    private String empleadoNombre;
    private String empleadoCorreo;
    private String empleadoArea;
}
