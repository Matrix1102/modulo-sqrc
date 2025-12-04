package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para una versión de artículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticuloVersionResponse {

    private Integer idArticuloVersion;
    private Integer idArticulo;
    private String codigoArticulo;
    private String tituloArticulo;
    private Integer numeroVersion;
    private String contenido;
    private String notaCambio;
    private LocalDateTime creadoEn;
    private Boolean esVigente;
    private EstadoArticulo estadoPropuesta;
    private OrigenVersion origen;

    // Información del creador (empleado)
    private Long idCreador;
    private String nombreCreador;
    private String apellidoCreador;
    private String nombreCompletoCreador;

    // Información del ticket origen (si aplica)
    private Long idTicketOrigen;
    private String asuntoTicket;
    private String estadoTicket;

    // Métricas de esta versión
    private Long feedbacksPositivos;
    private Long feedbacksNegativos;
    private Double calificacionPromedio;
    private Integer totalFeedbacks;
}
