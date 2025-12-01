package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "motivos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Motivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_motivo")
    private Long idMotivo;

    @Column(name = "nombre", length = 200)
    private String nombre;
}
