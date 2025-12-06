package com.sqrc.module.backendsqrc.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para rechazar/devolver un escalamiento al Agente.
 * El BackOffice usa este DTO cuando no puede aceptar el caso y necesita
 * devolverlo al Agente con feedback e instrucciones.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RechazarEscalamientoDTO {

    /**
     * Asunto del correo de respuesta que se enviará al Agente
     */
    @NotBlank(message = "El asunto es obligatorio")
    private String asunto;

    /**
     * Motivo por el cual el BackOffice rechaza el escalamiento.
     * Ej: "El problema descrito no es de nivel BackOffice",
     *     "Falta información técnica para proceder"
     */
    @NotBlank(message = "El motivo del rechazo es obligatorio")
    private String motivoRechazo;

    /**
     * Instrucciones específicas para que el Agente continúe con el caso.
     * Ej: "Intenta reiniciar el sistema del cliente y verificar conectividad",
     *     "Solicita al cliente los logs del error antes de escalar nuevamente"
     */
    @NotBlank(message = "Las instrucciones son obligatorias")
    private String instrucciones;
}
