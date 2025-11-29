package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EncuestaSummaryDTO {
    private Long idEncuesta;
    private Long plantillaId;
    private String estado;
    private String fechaEnvio;
    private Integer resendCount;
    private String lastSentAt;
}
