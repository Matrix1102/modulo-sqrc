package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para publicar un artículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicarArticuloRequest {

    @NotNull(message = "La visibilidad es obligatoria")
    private Visibilidad visibilidad;

    private LocalDateTime vigenteDesde;

    private LocalDateTime vigenteHasta;
}
