package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "opciones_pregunta")
public class OpcionPregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOpcion;

    @Column(nullable = false)
    private String texto; // Lo que ve el usuario (ej: "Muy Satisfecho")

    private Integer orden; // Para mostrar en el orden correcto (1, 2, 3...)

    private String valorInterno; // (Opcional) Un código para reportes, ej: "SCORE_5"

    // Relación inversa hacia la pregunta dueña
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    private PreguntaRadio pregunta;
}