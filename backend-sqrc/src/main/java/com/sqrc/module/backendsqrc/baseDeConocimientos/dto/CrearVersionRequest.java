package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva versión de un artículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearVersionRequest {

    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    @Size(max = 255, message = "La nota de cambio no puede exceder 255 caracteres")
    private String notaCambio;

    @NotNull(message = "El ID del creador es obligatorio")
    private Long idCreador;

    @Builder.Default
    private OrigenVersion origen = OrigenVersion.MANUAL;

    private Long idTicketOrigen;
}
