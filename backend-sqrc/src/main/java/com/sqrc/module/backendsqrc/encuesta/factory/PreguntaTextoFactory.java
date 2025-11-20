package com.sqrc.module.backendsqrc.encuesta.factory;

import com.sqrc.module.backendsqrc.encuesta.model.Pregunta;
import com.sqrc.module.backendsqrc.encuesta.model.PreguntaTexto;
import org.springframework.stereotype.Component;

// @Component("TEXTO") permite que Spring la identifique por el String "TEXTO"
@Component("TEXTO")
public class PreguntaTextoFactory implements PreguntaFactory {

    @Override
    public Pregunta crearPregunta() {
        PreguntaTexto pregunta = new PreguntaTexto();
        // Configuración por defecto según Regla de Negocio
        pregunta.setLongitudMaxima(255); 
        return pregunta;
    }
}