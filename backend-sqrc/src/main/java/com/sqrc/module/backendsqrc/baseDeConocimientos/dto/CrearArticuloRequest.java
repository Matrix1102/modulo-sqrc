package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para crear un nuevo artículo de conocimiento.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearArticuloRequest {

    @NotBlank(message = "El código es obligatorio")
    @Size(max = 50, message = "El código no puede exceder 50 caracteres")
    private String codigo;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 255, message = "El título no puede exceder 255 caracteres")
    private String titulo;

    @Size(max = 65535, message = "El resumen es demasiado largo")
    private String resumen;

    @NotNull(message = "La etiqueta es obligatoria")
    private Etiqueta etiqueta;

    private TipoCaso tipoCaso;

    @NotNull(message = "La visibilidad es obligatoria")
    private Visibilidad visibilidad;

    private String vigenteDesde;

    private String vigenteHasta;

    @NotNull(message = "El ID del propietario es obligatorio")
    private Long idPropietario;

    private String modulo;

    @Size(max = 500, message = "Los tags no pueden exceder 500 caracteres")
    private String tags;

    // Contenido inicial del artículo (primera versión)
    @NotBlank(message = "El contenido inicial es obligatorio")
    private String contenidoInicial;

    private String notaCambioInicial;

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
