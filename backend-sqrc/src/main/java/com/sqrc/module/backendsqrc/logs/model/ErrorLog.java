package com.sqrc.module.backendsqrc.logs.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad para almacenar logs de errores detallados.
 * Captura excepciones con su stack trace completo para debugging.
 */
@Entity
@Table(name = "error_logs", indexes = {
        @Index(name = "idx_error_timestamp", columnList = "timestamp"),
        @Index(name = "idx_error_exception", columnList = "exception_type"),
        @Index(name = "idx_error_correlation", columnList = "correlation_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "DATETIME(3)")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "exception_type", nullable = false, length = 200)
    private String exceptionType;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @Column(name = "request_uri", length = 500)
    private String requestUri;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "request_body", columnDefinition = "TEXT")
    private String requestBody;

    @Column(name = "correlation_id", length = 50)
    private String correlationId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;
}
