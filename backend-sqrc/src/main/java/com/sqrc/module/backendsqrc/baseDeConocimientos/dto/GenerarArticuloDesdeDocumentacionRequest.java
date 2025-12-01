package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para generar un artículo borrador desde la documentación de un ticket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerarArticuloDesdeDocumentacionRequest {

    @NotNull(message = "El ID de documentación es obligatorio")
    private Integer idDocumentacion;

    @NotBlank(message = "El título propuesto es obligatorio")
    private String tituloPropuesto;

    private String resumenPropuesto;

    @NotNull(message = "El ID del creador es obligatorio")
    private Long idCreador;

    @Builder.Default
    private OrigenVersion origen = OrigenVersion.DERIVADO_DE_DOCUMENTACION;
}
