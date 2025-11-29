package com.sqrc.module.backendsqrc.vista360.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO genérico para representar métricas KPI en las tarjetas de estadísticas.
 * Soporta los 4 indicadores: Tiempo Promedio, Tickets Abiertos, Calificación, Tickets del Mes.
 */
@Data
@Builder
public class MetricaKPI_DTO {

    /**
     * Título descriptivo de la métrica (ej: "Tiempo Promedio de Solución")
     */
    private String titulo;

    /**
     * Valor principal de la métrica (ej: "2.4", "5", "4.8")
     */
    private String valorPrincipal;

    /**
     * Unidad de medida (ej: "hrs", "/5", "", "tickets")
     */
    private String unidad;

    /**
     * Texto descriptivo de la tendencia (ej: "-12% vs mes anterior", "+2 del promedio")
     */
    private String subtituloTendencia;

    /**
     * Estado de la tendencia para determinar el color en el frontend
     */
    private EstadoTendencia estadoTendencia;

    /**
     * Enum para representar el estado visual de la tendencia
     */
    public enum EstadoTendencia {
        /**
         * Tendencia positiva (verde) - mejora respecto al período anterior
         */
        POSITIVO,

        /**
         * Tendencia negativa (rojo) - empeoramiento respecto al período anterior
         */
        NEGATIVO,

        /**
         * Tendencia neutra (gris) - sin cambios significativos
         */
        NEUTRO
    }
}
