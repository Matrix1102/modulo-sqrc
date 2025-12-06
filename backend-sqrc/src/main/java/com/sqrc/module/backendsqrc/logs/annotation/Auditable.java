package com.sqrc.module.backendsqrc.logs.annotation;

import com.sqrc.module.backendsqrc.logs.model.LogCategory;
import com.sqrc.module.backendsqrc.logs.model.LogLevel;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotación para marcar métodos que deben ser auditados automáticamente.
 * Usar en controladores o servicios para habilitar el logging automático.
 * 
 * Ejemplo de uso:
 * <pre>
 * {@code @Auditable(category = LogCategory.TICKET, action = "CREAR_TICKET")}
 * public TicketResponse crearTicket(TicketRequest request) { ... }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    
    /**
     * Categoría del log
     */
    LogCategory category();
    
    /**
     * Acción que se está realizando
     */
    String action();
    
    /**
     * Nivel del log (por defecto INFO)
     */
    LogLevel level() default LogLevel.INFO;
    
    /**
     * Tipo de entidad afectada (opcional)
     */
    String entityType() default "";
    
    /**
     * Descripción adicional (opcional)
     */
    String description() default "";
}
