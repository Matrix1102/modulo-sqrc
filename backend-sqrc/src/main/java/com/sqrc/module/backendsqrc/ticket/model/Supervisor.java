package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Entidad Supervisor que extiende de Empleado.
 * 
 * Responsabilidades del Supervisor:
 * - Supervisar equipos de agentes
 * - Ver tickets por equipo
 * - Crear y mantener artículos de Base de Conocimiento
 * - Gestionar plantillas de encuestas
 * - Ver dashboard de métricas
 */
@Entity
@Table(name = "supervisores")
@PrimaryKeyJoinColumn(name = "id_empleado")
@DiscriminatorValue("SUPERVISOR")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Supervisor extends Empleado {

    /**
     * Nivel de autorización del supervisor (1-5)
     */
    @Column(name = "nivel_autorizacion")
    @lombok.Builder.Default
    private Integer nivelAutorizacion = 1;

    /**
     * Departamento al que pertenece
     */
    @Column(name = "departamento", length = 100)
    private String departamento;

    /**
     * Si puede aprobar escalamientos
     */
    @Column(name = "puede_aprobar_escalamientos")
    @lombok.Builder.Default
    private Boolean puedeAprobarEscalamientos = true;

    /**
     * Obtiene los tickets del equipo que supervisa.
     * Este método se implementará en el servicio.
     */
    public String getDescripcionRol() {
        return "Supervisor de equipo";
    }
}
