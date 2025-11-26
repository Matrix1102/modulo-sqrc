package com.sqrc.module.backendsqrc.encuesta.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EncuestaRespondidaEvent {
    private Long idEncuesta;
    private Long idPlantilla;
    private boolean esCritica; // true si el puntaje fue bajo o hubo comentarios negativos
}