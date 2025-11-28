package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Long idAsignacion;

    // --- RELACIONES ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // Si tienes la clase Empleado, descomenta esto:
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "empleado_id")
    // private Empleado empleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_padre")
    private Asignacion asignacionPadre;


    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;


    @PrePersist
    public void prePersist() {
        if (this.fechaInicio == null) {
            this.fechaInicio = LocalDateTime.now();
        }
    }
}
