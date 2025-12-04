package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para publicar un artículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicarArticuloRequest {

    @NotNull(message = "La visibilidad es obligatoria")
    private Visibilidad visibilidad;

    private String vigenteDesde;

    private String vigenteHasta;

    /**
     * Convierte vigenteDesde string a LocalDateTime.
     * Acepta formatos: "2025-12-04" o "2025-12-04T00:00:00"
     */
    public LocalDateTime getVigenteDesdeAsDateTime() {
        if (vigenteDesde == null || vigenteDesde.isBlank()) {
            return null;
        }
        try {
            if (vigenteDesde.contains("T")) {
                return LocalDateTime.parse(vigenteDesde);
            } else {
                return LocalDate.parse(vigenteDesde).atStartOfDay();
            }
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Convierte vigenteHasta string a LocalDateTime.
     * Acepta formatos: "2025-12-04" o "2025-12-04T23:59:59"
     */
    public LocalDateTime getVigenteHastaAsDateTime() {
        if (vigenteHasta == null || vigenteHasta.isBlank()) {
            return null;
        }
        try {
            if (vigenteHasta.contains("T")) {
                return LocalDateTime.parse(vigenteHasta);
            } else {
                return LocalDate.parse(vigenteHasta).atTime(23, 59, 59);
            }
        } catch (Exception e) {
            return null;
        }
    }
}
