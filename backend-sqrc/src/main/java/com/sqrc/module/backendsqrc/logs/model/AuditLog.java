package com.sqrc.module.backendsqrc.logs.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entidad para almacenar logs de auditoría generales.
 * Registra todas las operaciones del sistema para trazabilidad.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
        @Index(name = "idx_audit_category", columnList = "category"),
        @Index(name = "idx_audit_user_id", columnList = "user_id"),
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_level", columnList = "level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "DATETIME(3)")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LogLevel level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LogCategory category;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_type", length = 30)
    private String userType;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 50)
    private String entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "request_uri", length = 500)
    private String requestUri;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "duration_ms")
    private Long durationMs;
}
