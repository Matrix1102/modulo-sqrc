package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa una llamada telefónica.
 * 
 * Regla de Negocio: 1 Ticket = máximo 1 Llamada (relación uno a uno opcional)
 * 
 * Estados de la llamada:
 * - ACEPTADA: Llamada aceptada por el agente
 * - DECLINADA: Llamada rechazada
 * - EN_ESPERA: Llamada en espera
 * - FINALIZADA: Llamada terminada
 */
@Entity
@Table(name = "llamadas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Llamada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_llamada")
    private Long idLlamada;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "duracion_segundos")
    @Builder.Default
    private Integer duracionSegundos = 0;

    @Column(name = "numero_origen", length = 20)
    private String numeroOrigen;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    @Builder.Default
    private EstadoLlamada estado = EstadoLlamada.ACEPTADA;

    /**
     * Relación uno a uno con Ticket (opcional).
     * Un ticket puede tener máximo una llamada asociada.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", unique = true)
    private Ticket ticket;

    /**
     * Empleado (agente) que atendió la llamada.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;

    /**
     * Motivo o destino de la llamada (registrado por el agente).
     */
    @Column(name = "motivo_destinacion", length = 255)
    private String motivoDestinacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaHora == null) {
            this.fechaHora = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoLlamada.ACEPTADA;
        }
        if (this.duracionSegundos == null) {
            this.duracionSegundos = 0;
        }
    }
}
