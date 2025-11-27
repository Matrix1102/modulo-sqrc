package com.sqrc.module.backendsqrc.plantillaRespuesta.chain;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;

public abstract class ValidadorRespuesta {

    protected ValidadorRespuesta siguiente;

    // Método para conectar el siguiente eslabón de la cadena
    public void setSiguiente(ValidadorRespuesta siguiente) {
        this.siguiente = siguiente;
    }

    // Método principal: Si paso la validación, llamo al siguiente.
    protected void siguiente(EnviarRespuestaRequestDTO request) {
        if (siguiente != null) {
            siguiente.validar(request);
        }
    }

    // Método abstracto que cada filtro debe implementar con su lógica
    public abstract void validar(EnviarRespuestaRequestDTO request);
}
