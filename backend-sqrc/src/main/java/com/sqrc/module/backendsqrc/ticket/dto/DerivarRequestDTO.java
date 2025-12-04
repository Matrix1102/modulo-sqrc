package com.sqrc.module.backendsqrc.ticket.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para la acción de Derivar.
 * Contiene los datos necesarios para enviar el correo externo a TI o Ventas.
 */
@Data // <--- ¡Aquí está! Lombok generará getters/setters por nosotros
public class DerivarRequestDTO {

    @NotNull(message = "Debes seleccionar el área de destino")
    private Long areaDestinoId;

    @NotBlank(message = "El asunto del correo es obligatorio")
    private String asunto;

    @NotBlank(message = "El cuerpo del correo es obligatorio")
    private String cuerpo;
}