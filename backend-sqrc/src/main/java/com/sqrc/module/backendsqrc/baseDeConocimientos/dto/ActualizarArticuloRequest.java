package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para actualizar un artículo existente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarArticuloRequest {

    @Size(max = 255, message = "El título no puede exceder 255 caracteres")
    private String titulo;

    @Size(max = 65535, message = "El resumen es demasiado largo")
    private String resumen;

    private Etiqueta etiqueta;

    private TipoCaso tipoCaso;

    private Visibilidad visibilidad;

    private String vigenteDesde;

    private String vigenteHasta;

    private String modulo;

    private Long idUltimoEditor;

    /**
     * Convierte vigenteDesde string a LocalDateTime.
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
