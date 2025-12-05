package com.sqrc.module.backendsqrc.baseDeConocimientos.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para el módulo de Base de Conocimientos.
 * 
 * Patrón: Controller Advice (AOP) - Centraliza el manejo de errores
 */
@RestControllerAdvice(basePackages = "com.sqrc.module.backendsqrc.baseDeConocimientos")
public class BaseConocimientoExceptionHandler {

    @ExceptionHandler(TransicionEstadoException.class)
    public ResponseEntity<ErrorResponse> handleTransicionEstado(TransicionEstadoException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("TRANSICION_ESTADO_INVALIDA")
                .estadoActual(ex.getEstadoActual() != null ? ex.getEstadoActual().name() : null)
                .estadoDestino(ex.getEstadoDestino() != null ? ex.getEstadoDestino().name() : null)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ArticuloNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleArticuloNotFound(ArticuloNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("ARTICULO_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(VersionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleVersionNotFound(VersionNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("VERSION_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CodigoArticuloDuplicadoException.class)
    public ResponseEntity<ErrorResponse> handleCodigoDuplicado(CodigoArticuloDuplicadoException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("CODIGO_DUPLICADO")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(OperacionInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleOperacionInvalida(OperacionInvalidaException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("OPERACION_INVALIDA")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errores.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Error de validación");
        response.put("codigo", "VALIDATION_ERROR");
        response.put("errores", errores);
        response.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje("Error interno del servidor: " + ex.getMessage())
                .codigo("INTERNAL_ERROR")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * DTO para respuestas de error estandarizadas.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String mensaje;
        private String codigo;
        private String estadoActual;
        private String estadoDestino;
        private LocalDateTime timestamp;
    }
}
