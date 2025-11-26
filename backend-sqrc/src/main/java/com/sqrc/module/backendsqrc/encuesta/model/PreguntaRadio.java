package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("RADIO")
public class PreguntaRadio extends Pregunta {

    // ELIMINAMOS: private String opciones;

    // AGREGAMOS: Relación One-to-Many real
    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OpcionPregunta> opciones = new ArrayList<>();

    // Método helper para agregar opciones fácilmente
    public void agregarOpcion(String texto, int orden) {
        OpcionPregunta opcion = new OpcionPregunta();
        opcion.setTexto(texto);
        opcion.setOrden(orden);
        opcion.setPregunta(this); // Vinculación bidireccional
        this.opciones.add(opcion);
    }

    @Override
    public boolean validar(String valorId) {
        if (valorId == null)
            return !getObligatoria();

        // Ahora validamos si el ID enviado existe en nuestra lista de opciones
        // (Asumiendo que el frontend envía el ID de la opción, no el texto)
        try {
            Long idBuscado = Long.parseLong(valorId);
            return opciones.stream().anyMatch(op -> Objects.equals(op.getIdOpcion(), idBuscado));
        } catch (NumberFormatException e) {
            return false;
        }
    }
}