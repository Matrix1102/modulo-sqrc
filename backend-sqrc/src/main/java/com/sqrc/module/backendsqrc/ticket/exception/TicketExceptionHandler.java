package com.sqrc.module.backendsqrc.ticket.exception;

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
 * Manejador global de excepciones para el módulo de tickets.
 * 
 * Patrón: Controller Advice (AOP) - Centraliza el manejo de errores
 */
@RestControllerAdvice(basePackages = "com.sqrc.module.backendsqrc.ticket")
public class TicketExceptionHandler {

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTicketNotFound(TicketNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("TICKET_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidStateTransition(InvalidStateTransitionException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("INVALID_STATE_TRANSITION")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TicketAlreadyAssignedException.class)
    public ResponseEntity<ErrorResponse> handleTicketAlreadyAssigned(TicketAlreadyAssignedException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("TICKET_ALREADY_ASSIGNED")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EmpleadoNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEmpleadoNotFound(EmpleadoNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("EMPLEADO_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ClienteNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleClienteNotFound(ClienteNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("CLIENTE_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DocumentacionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDocumentacionNotFound(DocumentacionNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("DOCUMENTACION_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AsignacionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAsignacionNotFound(AsignacionNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .mensaje(ex.getMessage())
                .codigo("ASIGNACION_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errores.put(fieldName, errorMessage);
        });

        ValidationErrorResponse response = ValidationErrorResponse.builder()
                .mensaje("Error de validación")
                .codigo("VALIDATION_ERROR")
                .timestamp(LocalDateTime.now())
                .errores(errores)
                .build();

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
     * DTO para respuestas de error estándar
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String mensaje;
        private String codigo;
        private LocalDateTime timestamp;
    }

    /**
     * DTO para respuestas de error de validación
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationErrorResponse {
        private String mensaje;
        private String codigo;
        private LocalDateTime timestamp;
        private Map<String, String> errores;
    }
}
