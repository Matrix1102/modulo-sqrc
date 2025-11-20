package com.sqrc.module.backendsqrc.encuesta.factory;

import com.sqrc.module.backendsqrc.encuesta.model.Pregunta;

public interface PreguntaFactory {
    /**
     * Crea una instancia vacía pero configurada de una pregunta específica.
     * @return Una subclase de Pregunta (Texto, Radio, etc.)
     */
    Pregunta crearPregunta();
}