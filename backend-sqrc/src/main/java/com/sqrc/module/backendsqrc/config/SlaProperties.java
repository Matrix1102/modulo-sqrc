package com.sqrc.module.backendsqrc.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "app.sla")
public class SlaProperties {

    /** Default SLA threshold in minutes (applies when no per-tipo value exists) */
    private Integer defaultMinutes = 120; // 2 hours default

    /** Per TipoCaso thresholds in minutes, e.g. SOLICITUD=2880 (48h), RECLAMO=1440 (24h) */
    private Map<String, Integer> porTipo = new HashMap<>();

    public Integer getDefaultMinutes() {
        return defaultMinutes;
    }

    public void setDefaultMinutes(Integer defaultMinutes) {
        this.defaultMinutes = defaultMinutes;
    }

    public Map<String, Integer> getPorTipo() {
        return porTipo;
    }

    public void setPorTipo(Map<String, Integer> porTipo) {
        this.porTipo = porTipo;
    }

    public int getThresholdForTipo(String tipo) {
        if (tipo == null) return defaultMinutes;
        return porTipo.getOrDefault(tipo, defaultMinutes);
    }
}
