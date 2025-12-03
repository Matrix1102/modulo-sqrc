package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documentacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Documentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documentacion")
    private Integer idDocumentacion;

    @Column(name = "problema", columnDefinition = "TEXT")
    private String problema;

    @Column(name = "id_articuloKB")
    private Integer idArticuloKB;

    @Column(name = "solucion", columnDefinition = "TEXT")
    private String solucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion")
    private Asignacion asignacion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
    }
}
