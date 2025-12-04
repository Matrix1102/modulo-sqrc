package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidad BackOffice que extiende de Empleado.
 * 
 * Responsabilidades del BackOffice:
 * - Recibir tickets escalados por los Agentes
 * - Aceptar o rechazar tickets escalados
 * - Derivar tickets a CUALQUIER área según su criterio
 * - Gestionar comunicación con módulos especializados (Inbox)
 * - Subir archivos y documentación
 * - Resolver tickets de reclamos
 * 
 * Nota: El BackOffice NO tiene área de especialización fija,
 * puede derivar a cualquier área que considere conveniente.
 */
@Entity
@Table(name = "backoffice")
@PrimaryKeyJoinColumn(name = "id_empleado")
@DiscriminatorValue("BACKOFFICE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BackOffice extends Empleado {

    /**
     * Máximo de tickets que puede manejar simultáneamente
     */
    @Column(name = "max_tickets_simultaneos")
    @Builder.Default
    private Integer maxTicketsSimultaneos = 10;

    /**
     * Si tiene permisos para derivar tickets a otras áreas.
     * El BackOffice puede derivar a cualquier área según su criterio.
     */
    @Column(name = "puede_derivar")
    @Builder.Default
    private Boolean puedeDerivar = true;

    /**
     * Tickets actualmente asignados al BackOffice
     */
    @OneToMany(mappedBy = "empleado")
    @Builder.Default
    private List<Asignacion> ticketsAsignados = new ArrayList<>();

    /**
     * Verifica si el BackOffice puede aceptar más tickets
     */
    public boolean puedeAceptarTicket() {
        long ticketsActivos = ticketsAsignados.stream()
                .filter(a -> a.getFechaFin() == null)
                .count();
        return ticketsActivos < maxTicketsSimultaneos;
    }

    public String getDescripcionRol() {
        return "BackOffice";
    }
}
