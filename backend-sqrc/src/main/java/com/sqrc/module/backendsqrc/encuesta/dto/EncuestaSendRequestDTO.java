package com.sqrc.module.backendsqrc.encuesta.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EncuestaSendRequestDTO(
        @NotBlank @Email String correoDestino,
        String asunto,
        Boolean attachPdf
) {}
