package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Arrays;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("RADIO")
public class PreguntaRadio extends Pregunta {

    // Guardamos las opciones en un String simple para evitar tablas complejas por ahora
    private String opciones; // Ej: "Rojo,Verde,Azul"

    @Override
    public boolean validar(String valor) {
        if (valor == null) return !getObligatoria();
        if (opciones == null || opciones.isEmpty()) return false;
        
        // Validamos que el valor enviado esté dentro de las opciones permitidas
        List<String> listaOpciones = Arrays.asList(opciones.split(","));
        return listaOpciones.contains(valor);
    }
    
    // Helper para el frontend
    public List<String> getListaOpciones() {
        return opciones != null ? Arrays.asList(opciones.split(",")) : List.of();
    }
}