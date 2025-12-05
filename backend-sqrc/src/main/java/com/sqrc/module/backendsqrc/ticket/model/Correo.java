package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "correo", schema = "bd_sqrc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Correo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_correo")
    private Long idCorreo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignacion", nullable = false)
    private Asignacion asignacion;

    @Column(nullable = false, length = 255)
    private String asunto;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String cuerpo;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_correo", nullable = false)
    private TipoCorreo tipoCorreo;

    @PrePersist
    protected void onCreate() {
        if (fechaEnvio == null) {
            fechaEnvio = LocalDateTime.now();
        }
    }
}

