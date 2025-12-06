package com.sqrc.module.backendsqrc.logs.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad para almacenar logs de integración con servicios externos.
 * Registra llamadas a APIs externas (mod-ventas, Gemini AI, SMTP).
 */
@Entity
@Table(name = "integration_logs", indexes = {
        @Index(name = "idx_integration_timestamp", columnList = "timestamp"),
        @Index(name = "idx_integration_service", columnList = "service_name"),
        @Index(name = "idx_integration_success", columnList = "success")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "DATETIME(3)")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "service_name", nullable = false, length = 100)
    private String serviceName;

    @Column(nullable = false, length = 100)
    private String operation;

    @Column(name = "request_url", length = 500)
    private String requestUrl;

    @Column(name = "request_method", length = 10)
    private String requestMethod;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column
    private Boolean success;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "correlation_id", length = 50)
    private String correlationId;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

    @Column(name = "response_payload", columnDefinition = "TEXT")
    private String responsePayload;
}
