package com.sqrc.module.backendsqrc.logs.model;

/**
 * Niveles de log para clasificar la severidad de los eventos.
 */
public enum LogLevel {
    /** Información general de operaciones normales */
    INFO,
    
    /** Advertencias que requieren atención pero no son errores */
    WARN,
    
    /** Errores que impiden el funcionamiento normal */
    ERROR,
    
    /** Información detallada para debugging */
    DEBUG
}
