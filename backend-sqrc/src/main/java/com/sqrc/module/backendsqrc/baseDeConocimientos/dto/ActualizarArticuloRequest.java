package com.sqrc.module.backendsqrc.baseDeConocimientos.dto;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private LocalDateTime vigenteDesde;

    private LocalDateTime vigenteHasta;

    private String modulo;

    private Long idUltimoEditor;
}
