package com.sqrc.module.backendsqrc.encuesta.factory;

import com.sqrc.module.backendsqrc.encuesta.model.Pregunta;
import com.sqrc.module.backendsqrc.encuesta.model.PreguntaBooleana;
import org.springframework.stereotype.Component;

@Component("BOOLEANA")
public class PreguntaBooleanaFactory implements PreguntaFactory {

    @Override
    public Pregunta crearPregunta() {
        PreguntaBooleana pregunta = new PreguntaBooleana();
        // Valores por defecto útiles
        pregunta.setValorVerdadero("Sí");
        pregunta.setValorFalso("No");
        return pregunta;
    }
}