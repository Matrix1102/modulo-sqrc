package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "plantillas_encuesta")
public class PlantillaEncuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPlantillaEncuesta;

    private String nombre;
    private String descripcion;
    private Boolean vigente;

    // Esta es la otra cara de la moneda: Una plantilla tiene muchas preguntas
    // 'mappedBy = "plantilla"' le dice a JPA: "La dueña de la relación es el campo 'plantilla' en la clase Pregunta"
    @OneToMany(mappedBy = "plantilla", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pregunta> preguntas;
}