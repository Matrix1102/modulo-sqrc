package com.sqrc.module.backendsqrc.encuesta.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "respuestas_encuesta")
public class RespuestaEncuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRespuestaEncuesta;

    // Vinculación con la encuesta enviada
    @OneToOne
    @JoinColumn(name = "encuesta_id", nullable = false)
    private Encuesta encuesta;

    private LocalDateTime fechaRespuesta;

    // Lista de respuestas individuales (una por pregunta)
    @OneToMany(mappedBy = "respuestaEncuesta", cascade = CascadeType.ALL)
    private List<RespuestaPregunta> respuestas;

    @PrePersist
    public void prePersist() {
        if (this.fechaRespuesta == null) {
            this.fechaRespuesta = LocalDateTime.now();
        }
    }
}