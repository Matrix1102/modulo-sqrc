package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para un artículo con información resumida.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticuloResponse {

    private Integer idArticulo;
    private String codigo;
    private String titulo;
    private String resumen;
    private Etiqueta etiqueta;
    private TipoCaso tipoCaso;
    private Visibilidad visibilidad;
    private LocalDateTime vigenteDesde;
    private LocalDateTime vigenteHasta;
    private String modulo;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;

    // Información del propietario
    private Long idPropietario;
    private String nombrePropietario;

    // Información del último editor
    private Long idUltimoEditor;
    private String nombreUltimoEditor;

    // Información de la versión vigente
    private Integer versionVigente;
    private EstadoArticulo estadoVersionVigente;
    private String contenidoVersionVigente;

    // Métricas
    private Integer totalVersiones;
    private Long feedbacksPositivos;
    private Double calificacionPromedio;

    // Estado calculado
    private boolean estaVigente;
}
