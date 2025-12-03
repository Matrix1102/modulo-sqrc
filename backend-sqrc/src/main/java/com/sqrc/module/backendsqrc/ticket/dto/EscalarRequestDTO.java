package com.sqrc.module.backendsqrc.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO de Entrada (Request).
 * Transporta SOLO los datos que el Agente escribe en el formulario del Frontend.
 */
@Data
public class EscalarRequestDTO {

    // El "Asunto" del correo o título del escalamiento
    @NotBlank(message = "El asunto no puede estar vacío")
    private String asunto;

    // Detalle del problema técnico
    @NotBlank(message = "La problemática es obligatoria")
    private String problematica;

    // Razón por la que se escala (regla de negocio)
    @NotBlank(message = "La justificación es obligatoria")
    private String justificacion;
}