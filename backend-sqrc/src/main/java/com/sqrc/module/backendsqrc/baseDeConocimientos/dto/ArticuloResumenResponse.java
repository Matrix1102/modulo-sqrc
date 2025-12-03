package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para listado resumido de artículos (cards/tablas).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticuloResumenResponse {

    private Integer idArticulo;
    private String codigo;
    private String titulo;
    private String resumen;
    private Etiqueta etiqueta;
    private TipoCaso tipoCaso;
    private Visibilidad visibilidad;
    private String tags;
    private String nombrePropietario;
    private String fechaModificacion;
    private Integer versionActual;
    private Long feedbacksPositivos;
    private Long vistas;
    private boolean estaVigente;
    private String estado; // Publicado, Borrador, Archivado, etc.
}
