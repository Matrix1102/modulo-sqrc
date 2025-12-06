package com.sqrc.module.backendsqrc.vista360.exception;

import com.sqrc.module.backendsqrc.logs.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
 * Manejador global de excepciones para el módulo Vista 360 Cliente.
 * Captura excepciones comunes y las transforma en respuestas HTTP estandarizadas.
 * Además, registra los errores en la base de datos de logs para auditoría.
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final AuditLogService auditLogService;

    /**
     * Maneja excepciones cuando no se encuentra un cliente.
     *
     * @param ex Exception lanzada
     * @param request HttpServletRequest actual
     * @return ResponseEntity con ErrorResponse y status 404
     */
    @ExceptionHandler(ClienteNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleClienteNotFoundException(
            ClienteNotFoundException ex,
            HttpServletRequest request) {

        log.error("Cliente no encontrado: {}", ex.getMessage());

        // Registrar en BD de logs
        auditLogService.logError(ex, request.getRequestURI(), request.getMethod());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Maneja excepciones de validación de los DTOs (ej: @Valid en ClienteBasicoDTO).
     *
     * @param ex MethodArgumentNotValidException con los errores de validación
     * @param request HttpServletRequest actual
     * @return ResponseEntity con ErrorResponse y status 400
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        log.error("Errores de validación en la petición: {}", ex.getBindingResult().getFieldErrorCount());

        // Registrar en BD de logs
        auditLogService.logError(ex, request.getRequestURI(), request.getMethod());

        // Extraer los errores de validación de cada campo
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Error de validación en los datos proporcionados")
                .path(request.getRequestURI())
                .validationErrors(validationErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Maneja argumentos ilegales (ej: formato de DNI incorrecto).
     *
     * @param ex IllegalArgumentException lanzada
     * @param request HttpServletRequest actual
     * @return ResponseEntity con ErrorResponse y status 400
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        log.error("Argumento ilegal: {}", ex.getMessage());

        // Registrar en BD de logs
        auditLogService.logError(ex, request.getRequestURI(), request.getMethod());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Maneja cualquier otra excepción no capturada específicamente.
     *
     * @param ex Exception genérica
     * @param request HttpServletRequest actual
     * @return ResponseEntity con ErrorResponse y status 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Error interno del servidor: {}", ex.getMessage(), ex);

        // Registrar en BD de logs (errores críticos)
        auditLogService.logError(ex, request.getRequestURI(), request.getMethod());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("Ha ocurrido un error interno en el servidor. Por favor, contacte al administrador.")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
