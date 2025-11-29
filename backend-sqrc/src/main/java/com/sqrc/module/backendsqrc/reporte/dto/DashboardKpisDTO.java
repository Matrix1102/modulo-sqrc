package com.sqrc.module.backendsqrc.reporte.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardKpisDTO {
    private KpisGlobalesDTO kpisGlobales;
    // Ahora exponemos un mapa por canal (clave: GLOBAL, TELEFONICO, PRESENCIAL, etc.)
    // Cada valor contiene los KPI resumidos para ese canal
    private java.util.Map<String, KpisResumenDTO> kpisResumen;
    private List<MotivoFrecuenteDTO> motivosFrecuentes;
    private List<AgenteRankingDTO> agentesMejorEvaluados;

    @Data
    @Builder
    public static class KpisGlobalesDTO {
        private Integer totalCasos;
        // Map canal -> lista de { tipo, cantidad }
        private java.util.Map<String, List<DesgloseTipoDTO>> desglosePorCanal;
    }

    @Data
    @Builder
    public static class DesgloseTipoDTO {
        private String tipo;
        private Integer cantidad;
    }

    @Data
    @Builder
    public static class KpisResumenDTO {
        private KpiValorDTO ticketsAbiertos;
        private KpiValorDTO ticketsResueltos;
        private KpiValorDTO tiempoPromedio; 
    }

    @Data
    @Builder
    public static class KpiValorDTO {
        private Object valor; // Puede ser Integer (12) o String ("2.4 hrs")
        private Integer comparativoPeriodo; // Ej: 8 (valor absoluto, sin formato)
        @JsonProperty("comparativoPeriodo_pct")
        private Integer comparativoPeriodoPct; // Ej: -12 (opcional, para porcentajes)
    }
    
    @Data
    @Builder
    public static class MotivoFrecuenteDTO {
        private String motivo;
        private Integer cantidad;
    }

    @Data
    @Builder
    public static class AgenteRankingDTO {
        private Long agenteId;
        private String nombre;
        private Double rating;
        private Integer tickets;
    }
}