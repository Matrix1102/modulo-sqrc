package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("BOOLEANA")
public class PreguntaBooleana extends Pregunta {

    private String valorVerdadero; // Ej: "Sí", "De acuerdo"
    private String valorFalso;     // Ej: "No", "En desacuerdo"

    @Override
    public boolean validar(String valor) {
        if (valor == null) return !getObligatoria();
        return valor.equalsIgnoreCase(valorVerdadero) || valor.equalsIgnoreCase(valorFalso);
    }
}