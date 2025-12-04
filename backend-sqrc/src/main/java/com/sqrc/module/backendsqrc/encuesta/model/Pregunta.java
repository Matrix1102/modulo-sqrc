package com.sqrc.module.backendsqrc.encuesta.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "preguntas")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // Estrategia clave: Una tabla para todos los tipos
@DiscriminatorColumn(name = "tipo_pregunta", discriminatorType = DiscriminatorType.STRING)
public abstract class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPregunta;

    @Column(nullable = false)
    private String texto; // "enunciado" en versiones anteriores, "texto" según tu diagrama

    private Boolean obligatoria;
    private Integer orden;

    /**
     * Indica si esta pregunta es la pregunta de calificación general (1-5).
     * Solo puede haber una por plantilla. Su valor se copia a RespuestaEncuesta.calificacion.
     */
    @Column(name = "es_calificacion")
    private Boolean esCalificacion = false;

    // Relación con la Plantilla (N a 1)
    @ManyToOne
    @JoinColumn(name = "plantilla_id")
    @JsonIgnore // Importante: Evita que al pedir una pregunta se traiga toda la plantilla en bucle
    private PlantillaEncuesta plantilla;

    /**
     * Método abstracto que obliga a cada tipo de pregunta a definir
     * cómo se valida la respuesta del usuario.
     */
    public abstract boolean validar(String valor);
}