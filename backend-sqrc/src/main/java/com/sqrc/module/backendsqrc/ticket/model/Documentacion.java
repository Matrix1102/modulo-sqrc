package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentacion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Documentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDocumentacion;

    // Relación con la asignación (Vital para saber a qué ticket pertenece)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion", nullable = false)
    private Asignacion asignacion;

    // --- CAMPOS QUE FALTABAN (Para coincidir con tu tabla) ---

    @Column(name = "id_articulo_kb")
    private Integer idArticuloKB; // Puede ser nulo si no se usó un artículo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado") // Relación con el empleado que documentó
    private Empleado empleado;

    // ---------------------------------------------------------

    @Column(columnDefinition = "TEXT")
    private String problema;

    @Column(columnDefinition = "TEXT")
    private String solucion; // Aquí va la justificación del escalamiento

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
    }
}