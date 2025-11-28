package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "solicitudes")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "id_ticket")
@DiscriminatorValue("SOLICITUD")
public class Solicitud extends Ticket {

    @Column(name = "tipo_solicitud")
    private String tipoSolicitud;
}
