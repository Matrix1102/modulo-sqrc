package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Agente especializado en atención presencial.
 * 
 * Patrón: Herencia + Template Method
 * - Extiende de Agente (clase abstracta)
 * - Implementa métodos específicos para canal PRESENCIAL
 * 
 * Responsabilidades específicas:
 * - Atender clientes que llegan físicamente
 * - Descargar/generar PDFs de constancias
 * - Crear tickets con origen PRESENCIAL
 */
@Entity
@Table(name = "agentes_presencial")
@PrimaryKeyJoinColumn(name = "id_empleado")
@DiscriminatorValue("AGENTE_PRESENCIAL")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AgentePresencial extends Agente {

    /**
     * Ventanilla asignada al agente
     */
    @Column(name = "ventanilla", length = 20)
    private String ventanilla;

    /**
     * Sede donde trabaja el agente
     */
    @Column(name = "sede", length = 100)
    private String sede;

    /**
     * Contador de clientes atendidos hoy
     */
    @Column(name = "clientes_atendidos_hoy")
    @lombok.Builder.Default
    private Integer clientesAtendidosHoy = 0;

    /**
     * Descarga el PDF de constancia para el cliente.
     * La implementación real genera el PDF.
     */
    public void descargarPDF() {
        // La implementación real está en el servicio de constancias
    }

    @Override
    public Ticket crearTicket() {
        // El ticket se crea con origen PRESENCIAL
        // La implementación real está en TicketGestionService
        return null;
    }

    /**
     * Incrementa el contador de atenciones diarias.
     */
    public void registrarAtencion() {
        if (this.clientesAtendidosHoy == null) {
            this.clientesAtendidosHoy = 0;
        }
        this.clientesAtendidosHoy++;
    }

    /**
     * Reinicia el contador de atenciones (llamar al inicio de cada día).
     */
    public void reiniciarContadorDiario() {
        this.clientesAtendidosHoy = 0;
    }

    public String getDescripcionRol() {
        return "Agente Presencial";
    }
}
