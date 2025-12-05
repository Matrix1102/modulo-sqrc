package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO con el contenido generado por la IA para crear un artículo.
 * Contiene todos los campos necesarios para crear el artículo y su versión
 * inicial.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticuloGeneradoIA {

    /**
     * Título sugerido para el artículo.
     */
    private String titulo;

    /**
     * Resumen breve del artículo (2-3 oraciones).
     */
    private String resumen;

    /**
     * Contenido completo del artículo en formato HTML.
     */
    private String contenido;

    /**
     * Etiqueta/categoría sugerida para el artículo.
     */
    private Etiqueta etiqueta;

    /**
     * Tipo de caso al que aplica el artículo.
     */
    private TipoCaso tipoCaso;

    /**
     * Visibilidad sugerida.
     */
    private Visibilidad visibilidad;

    /**
     * Tags/palabras clave sugeridas, separadas por comas.
     */
    private String tags;

    /**
     * Nota de cambio para la versión inicial.
     */
    private String notaCambio;

    /**
     * Confianza de la IA en la generación (0.0 a 1.0).
     */
    private Double confianza;

    /**
     * Sugerencias adicionales de la IA.
     */
    private List<String> sugerencias;

    /**
     * ID del artículo creado (si se guardó automáticamente).
     */
    private Integer idArticuloCreado;

    /**
     * Código del artículo creado (si se guardó automáticamente).
     */
    private String codigoArticuloCreado;
}
