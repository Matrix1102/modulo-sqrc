
package com.sqrc.module.backendsqrc.encuesta.factory;

import com.sqrc.module.backendsqrc.encuesta.model.Pregunta;
import com.sqrc.module.backendsqrc.encuesta.model.PreguntaRadio;
import org.springframework.stereotype.Component;

@Component("RADIO")
public class PreguntaRadioFactory implements PreguntaFactory {

    @Override
    public Pregunta crearPregunta() {
        PreguntaRadio pregunta = new PreguntaRadio();
        // Se inicializa vacía, las opciones se setean luego en el servicio
        return pregunta;
    }
}