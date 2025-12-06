package com.sqrc.module.backendsqrc.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para exponer información de NotificacionExterna al frontend.
 * Contiene los datos necesarios para mostrar derivaciones en el timeline
 * y en el simulador de área externa.
 * Ahora incluye los campos de respuesta integrados en el mismo objeto.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionExternaDTO {

    private Long idNotificacion;
    private Long ticketId;
    private Long areaDestinoId;
    private String asunto;
    private String cuerpo;
    private String destinatarioEmail;
    private String fechaEnvio; // ISO string format
    
    // Campos de respuesta
    private String respuesta;
    private String fechaRespuesta; // ISO string format
    
    /**
     * Método helper para verificar si la notificación tiene respuesta
     */
    public boolean tieneRespuesta() {
        return respuesta != null && !respuesta.trim().isEmpty();
    }
}

