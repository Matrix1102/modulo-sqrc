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
 * Clase abstracta Agente que extiende de Empleado.
 * 
 * Patrón: Template Method
 * - Define comportamiento común para AgenteLlamada y AgentePresencial
 * - Los métodos abstractos son implementados por cada subtipo
 * 
 * Responsabilidades comunes de los Agentes:
 * - Atender clientes
 * - Crear tickets
 * - Documentar tickets
 * - Escalar tickets a BackOffice
 * - Consultar Base de Conocimiento
 */
@Entity
@Table(name = "agentes")
@PrimaryKeyJoinColumn(name = "id_empleado")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class Agente extends Empleado {

    /**
     * Canal de origen que maneja este agente (LLAMADA o PRESENCIAL)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "canal_origen", nullable = false, length = 20)
    private OrigenTicket canalOrigen;

    /**
     * Supervisor asignado al agente
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    /**
     * Lista de tickets asignados al agente
     */
    @OneToMany(mappedBy = "empleado")
    @Builder.Default
    private List<Asignacion> tickets = new ArrayList<>();

    /**
     * Indica si el agente está ocupado atendiendo
     */
    @Column(name = "esta_ocupado")
    @Builder.Default
    private Boolean estaOcupado = false;

    /**
     * Documenta un caso con la problemática y solución.
     * Implementación común para todos los agentes.
     */
    public void documentarCaso() {
        // La lógica real está en DocumentacionService
    }

    /**
     * Escala un ticket al BackOffice.
     * Retorna true si el escalamiento fue exitoso.
     */
    public boolean escalarTicket(Ticket ticket, String motivoEscalamiento) {
        // La lógica real está en TicketGestionService
        return ticket != null && ticket.getEstado() == EstadoTicket.ABIERTO;
    }

    /**
     * Crea un nuevo ticket.
     * La implementación varía según el tipo de agente.
     */
    public abstract Ticket crearTicket();

    /**
     * Verifica si el agente puede atender un ticket del canal especificado.
     */
    public boolean puedeAtenderCanal(OrigenTicket origen) {
        return this.canalOrigen == origen;
    }
}
