package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Representa el feedback dado por un empleado a una versión específica de un
 * artículo.
 * Permite medir la utilidad y calidad de los artículos de conocimiento.
 */
@Entity
@Table(name = "feedback_articulos", indexes = {
        @Index(name = "idx_feedback_version", columnList = "id_version"),
        @Index(name = "idx_feedback_empleado", columnList = "id_empleado"),
        @Index(name = "idx_feedback_util", columnList = "util")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackArticulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_feedback")
    private Integer idFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_version", nullable = false)
    private ArticuloVersion articuloVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "comentario", length = 500)
    private String comentario;

    @Column(name = "calificacion")
    private Integer calificacion;

    @Column(name = "util", nullable = false)
    @Builder.Default
    private Boolean util = false;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    /**
     * Registra el feedback con la calificación y comentario.
     */
    public void registrarFeedback(Integer calificacion, String comentario, Boolean esUtil) {
        this.calificacion = calificacion;
        this.comentario = comentario;
        this.util = esUtil != null ? esUtil : false;
    }

    /**
     * Valida que la calificación esté en un rango válido (1-5).
     */
    public boolean esCalificacionValida() {
        return calificacion != null && calificacion >= 1 && calificacion <= 5;
    }

    @PrePersist
    public void prePersist() {
        if (this.creadoEn == null) {
            this.creadoEn = LocalDateTime.now();
        }
        if (this.util == null) {
            this.util = false;
        }
    }
}
