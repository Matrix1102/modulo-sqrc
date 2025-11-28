package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "quejas")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "id_ticket")
@DiscriminatorValue("QUEJA") // Valor en la BD para tipo_ticket
public class Queja extends Ticket {

    @Column(name = "impacto", columnDefinition = "TEXT")
    private String impacto;

    @Column(name = "area_involucrada")
    private String areaInvolucrada;
}
