package com.sqrc.module.backendsqrc.ticket.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para la acción de Derivar.
 * Contiene los datos necesarios para enviar el correo externo a TI, Ventas, Infraestructura, etc.
 */
@Data
public class DerivarRequestDTO {

    @NotNull(message = "Debes seleccionar el área de destino")
    private Long areaDestinoId;

    @NotBlank(message = "El asunto es obligatorio")
    private String asunto;

    @NotBlank(message = "El cuerpo del mensaje es obligatorio")
    private String cuerpo;
}