package com.sqrc.module.backendsqrc.ticket.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "consultas")
@Data
@EqualsAndHashCode(callSuper = true) // Incluye los campos del padre en comparaciones
@PrimaryKeyJoinColumn(name = "id_ticket") // La clave primaria es también la foránea hacia tickets
@DiscriminatorValue("CONSULTA") // Lo que Hibernate escribirá en la columna 'tipo_ticket'
public class Consulta extends Ticket {

    @Column(name = "tema", length = 255)
    private String tema;
}
