package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Table(name = "reclamos")
@Data //incluir getters,setters,toStrings
@EqualsAndHashCode(callSuper = true) // importante para que Lombok incluya los campos del padre
@PrimaryKeyJoinColumn(name = "id_ticket") // une la tabla reclamos con tickets por este ID. indica que el id no es nuevo, esta en tabla ticket
@DiscriminatorValue("RECLAMO") // El valor que va en la columna 'tipo_ticket'
public class Reclamo extends Ticket {

    @Column(name = "motivo_reclamo", columnDefinition = "TEXT")
    private String motivoReclamo;

    @Column(name = "fecha_limite_respuesta")
    private LocalDate fechaLimiteRespuesta;

    @Column(name = "fecha_limite_resolucion")
    private LocalDate fechaLimiteResolucion;

    @Column(name = "resultado")
    private String resultado; // O un Enum si tienes uno
}