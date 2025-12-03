package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para estadísticas de feedback de una versión.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackEstadisticasResponse {

    private Integer idVersion;
    private Long feedbacksPositivos;
    private Long feedbacksNegativos;
    private Long totalFeedbacks;
    private Double calificacionPromedio;
}
