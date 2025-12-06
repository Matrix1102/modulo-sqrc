package com.sqrc.module.backendsqrc.logs.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entidad para almacenar logs específicos del flujo de trabajo de tickets.
 * Registra escalamientos, derivaciones, cierres y otras transiciones de estado.
 */
@Entity
@Table(name = "ticket_workflow_logs", indexes = {
        @Index(name = "idx_workflow_ticket", columnList = "ticket_id"),
        @Index(name = "idx_workflow_timestamp", columnList = "timestamp"),
        @Index(name = "idx_workflow_action", columnList = "action")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketWorkflowLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "DATETIME(3)")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "estado_anterior", length = 30)
    private String estadoAnterior;

    @Column(name = "estado_nuevo", length = 30)
    private String estadoNuevo;

    @Column(name = "empleado_origen_id")
    private Long empleadoOrigenId;

    @Column(name = "empleado_origen_nombre", length = 100)
    private String empleadoOrigenNombre;

    @Column(name = "empleado_destino_id")
    private Long empleadoDestinoId;

    @Column(name = "empleado_destino_nombre", length = 100)
    private String empleadoDestinoNombre;

    @Column(name = "area_destino_id")
    private Long areaDestinoId;

    @Column(name = "area_destino_nombre", length = 100)
    private String areaDestinoNombre;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> detalles;
}
