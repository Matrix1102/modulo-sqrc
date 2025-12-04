package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EncuestaSummaryDTO {
    private Long idEncuesta;
    private Long plantillaId;
    private String plantillaNombre;
    private String estado;
    private String alcanceEvaluacion;
    private String fechaEnvio;
    private String fechaExpiracion;
    private Integer resendCount;
    private String lastSentAt;
    
    // Información del contexto
    private Long ticketId;
    private Long agenteId;
    private String agenteNombre;
    private Integer clienteId;
    private String clienteNombre;
}
