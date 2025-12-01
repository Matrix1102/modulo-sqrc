package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para feedback de artículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private Integer idFeedback;
    private Integer idVersion;
    private Integer numeroVersion;
    private Integer idArticulo;
    private String tituloArticulo;

    private Long idEmpleado;
    private String nombreEmpleado;

    private String comentario;
    private Integer calificacion;
    private Boolean util;
    private LocalDateTime creadoEn;
}
