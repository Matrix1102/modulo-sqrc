package com.sqrc.module.backendsqrc.logs.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuración para habilitar la ejecución asíncrona.
 * Permite que los logs se registren en segundo plano sin afectar
 * el rendimiento de las operaciones principales.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // La configuración por defecto de Spring es suficiente para nuestros propósitos
    // Se puede personalizar el executor si se necesita más control
}
