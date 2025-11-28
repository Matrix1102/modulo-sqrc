package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Inheritance(strategy = InheritanceType.JOINED) // para herencia de los tipos de ticket
@DiscriminatorColumn(name = "tipo_ticket", discriminatorType = DiscriminatorType.STRING) // Usa tu columna tipo_ticket
@Data
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Long idTicket;

    @Column(name = "asunto")
    private String asunto;

    @Column(name = "descripcion")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoTicket estado;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    /*
    // relación con Cliente - nai cliente aun
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
   */
}