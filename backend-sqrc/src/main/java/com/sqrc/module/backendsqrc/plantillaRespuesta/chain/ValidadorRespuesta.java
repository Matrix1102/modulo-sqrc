package com.sqrc.module.backendsqrc.plantillaRespuesta.chain;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;

public abstract class ValidadorRespuesta {

    protected ValidadorRespuesta siguiente;

    //metodo para conectar el siguiente eslabón de la cadena
    public ValidadorRespuesta setSiguiente(ValidadorRespuesta siguiente) {
        this.siguiente = siguiente;
        return siguiente;
    }

    //si paso la validación, llamo al siguiente.
    protected void siguiente(EnviarRespuestaRequestDTO request) {
        if (siguiente != null) {
            siguiente.validar(request);
        }
    }

    //mtodo abstracto que cada filtro debe implementar con su logica
    public abstract void validar(EnviarRespuestaRequestDTO request);
}
