package com.sqrc.module.backendsqrc.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardKpisDTO {
    private KpisGlobalesDTO kpisGlobales;
    private KpisResumenDTO kpisResumen;
    private List<MotivoFrecuenteDTO> motivosFrecuentes;
    private List<AgenteRankingDTO> agentesMejorEvaluados;

    @Data
    @Builder
    public static class KpisGlobalesDTO {
        private Integer totalCasos;
        private List<DesgloseTipoDTO> desgloseTipo;
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
        private String comparativoPeriodo; // Ej: "+8"
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
        private String agenteId;
        private String nombre;
        private Double rating;
        private Integer tickets;
    }
}