package com.sqrc.module.backendsqrc.ticket.model;

import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Long idTicket;

    @Column(name = "asunto", length = 100)
    private String asunto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motivo_id")
    private Motivo motivo;

    @Column(name = "descripcion", length = 300)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoTicket estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Enumerated(EnumType.STRING)
    @Column(name = "origen", nullable = false)
    private OrigenTicket origen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private ClienteEntity cliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_ticket", nullable = false, insertable = false, updatable = false)
    private TipoTicket tipoTicket;

    @Column(name = "id_constancia")
    private Integer idConstancia;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Asignacion> asignaciones = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoTicket.ABIERTO;
        }
    }
}