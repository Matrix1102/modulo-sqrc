package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.*;
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
    private Long idDocumentacion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false)
    private Asignacion asignacion;

    @Lob
    @Column(name = "problema", columnDefinition = "TEXT")
    private String problema;

    @Lob
    @Column(name = "solucion", columnDefinition = "TEXT")
    private String solucion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
    }
}

