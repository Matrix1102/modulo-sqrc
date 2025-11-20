package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("TEXTO") // Este valor se guardará en la columna 'tipo_pregunta'
public class PreguntaTexto extends Pregunta {

    private Integer longitudMaxima;

    @Override
    public boolean validar(String valor) {
        if (valor == null) return !getObligatoria();
        return valor.length() <= (longitudMaxima != null ? longitudMaxima : 255);
    }
}