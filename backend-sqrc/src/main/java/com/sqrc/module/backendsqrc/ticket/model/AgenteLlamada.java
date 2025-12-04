package com.sqrc.module.backendsqrc.ticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Agente especializado en atención telefónica (Llamadas).
 * 
 * Patrón: Herencia + Template Method
 * - Extiende de Agente (clase abstracta)
 * - Implementa métodos específicos para canal LLAMADA
 * 
 * Regla de Negocio:
 * - Máximo 2 llamadas simultáneas por agente
 * - Si todos los agentes tienen 1 llamada, pueden recibir una segunda
 * 
 * Responsabilidades específicas:
 * - Aceptar/Declinar llamadas
 * - Poner llamadas en espera
 * - Finalizar llamadas
 * - Asociar llamadas a tickets
 */
@Entity
@Table(name = "agentes_llamada")
@PrimaryKeyJoinColumn(name = "id_empleado")
@DiscriminatorValue("AGENTE_LLAMADA")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AgenteLlamada extends Agente {

    /**
     * Máximo de llamadas simultáneas permitidas
     */
    public static final int MAX_LLAMADAS_SIMULTANEAS = 2;

    /**
     * Extensión telefónica del agente
     */
    @Column(name = "extension_telefonica", length = 10)
    private String extensionTelefonica;

    /**
     * Contador de llamadas atendidas en el día
     */
    @Column(name = "llamadas_atendidas_hoy")
    @Builder.Default
    private Integer llamadasAtendidasHoy = 0;

    /**
     * Tiempo promedio de llamada en segundos
     */
    @Column(name = "tiempo_promedio_llamada")
    @Builder.Default
    private Integer tiempoPromedioLlamada = 0;

    /**
     * Cantidad de llamadas activas actualmente
     */
    @Column(name = "llamadas_activas")
    @Builder.Default
    private Integer llamadasActivas = 0;

    /**
     * Verifica si puede recibir más llamadas (máximo 2)
     */
    public boolean puedeRecibirLlamada() {
        return llamadasActivas < MAX_LLAMADAS_SIMULTANEAS;
    }

    /**
     * Verifica si está completamente ocupado (tiene 2 llamadas)
     */
    public boolean estaCompletoOcupado() {
        return llamadasActivas >= MAX_LLAMADAS_SIMULTANEAS;
    }

    /**
     * Acepta una llamada entrante.
     */
    public boolean aceptarLlamada(Llamada llamada) {
        if (llamada == null || !puedeRecibirLlamada()) {
            return false;
        }
        llamada.setEstado(EstadoLlamada.ACEPTADA);
        this.llamadasActivas++;
        this.setEstaOcupado(true);
        return true;
    }

    /**
     * Declina una llamada entrante.
     */
    public void declinarLlamada(Llamada llamada) {
        if (llamada != null) {
            llamada.setEstado(EstadoLlamada.DECLINADA);
        }
    }

    /**
     * Registra el motivo de la llamada.
     */
    public void motivoLlamada(Llamada llamada, String motivo) {
        if (llamada != null) {
            llamada.setMotivoDestinacion(motivo);
        }
    }

    /**
     * Finaliza una llamada.
     */
    public void finalizarLlamada(Llamada llamada) {
        if (llamada != null) {
            llamada.setEstado(EstadoLlamada.FINALIZADA);
            if (this.llamadasActivas > 0) {
                this.llamadasActivas--;
            }
            if (this.llamadasActivas == 0) {
                this.setEstaOcupado(false);
            }
            this.llamadasAtendidasHoy++;
        }
    }

    /**
     * Pone una llamada en espera.
     */
    public void ponerEnEspera(Llamada llamada) {
        if (llamada != null) {
            llamada.setEstado(EstadoLlamada.EN_ESPERA);
        }
    }

    @Override
    public Ticket crearTicket() {
        // El ticket se crea con origen LLAMADA
        // La implementación real está en TicketGestionService
        return null;
    }

    public String getDescripcionRol() {
        return "Agente de Llamadas";
    }
}
