package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "respuestas_pregunta")
public class RespuestaPregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ¿A qué "sobre" de respuestas pertenece?
    @ManyToOne
    @JoinColumn(name = "respuesta_encuesta_id")
    private RespuestaEncuesta respuestaEncuesta;

    // ¿A qué pregunta específica está respondiendo?
    @ManyToOne
    @JoinColumn(name = "pregunta_id")
    private Pregunta pregunta;

    // El valor ingresado (Texto libre, o la opción seleccionada "Si", "Muy Bueno")
    @Column(columnDefinition = "TEXT")
    private String valor;
}