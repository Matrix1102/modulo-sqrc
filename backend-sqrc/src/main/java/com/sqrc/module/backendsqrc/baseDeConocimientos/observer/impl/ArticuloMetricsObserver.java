package com.sqrc.module.backendsqrc.baseDeConocimientos.observer.impl;

import org.springframework.stereotype.Component;

import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.IArticuloObserver;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent.TipoEventoArticulo;

import lombok.extern.slf4j.Slf4j;

/**
 * Observer Pattern - Observer para métricas y estadísticas de artículos.
 * 
 * <p>Recopila métricas sobre los eventos de artículos para análisis
 * y dashboards. Se ejecuta de forma asíncrona para no bloquear
 * las operaciones principales.</p>
 * 
 * <p><b>Métricas recopiladas:</b></p>
 * <ul>
 *   <li>Contador de artículos creados</li>
 *   <li>Contador de versiones publicadas</li>
 *   <li>Tasa de rechazo de versiones</li>
 *   <li>Tiempo promedio hasta publicación</li>
 * </ul>
 */
@Component
@Slf4j
public class ArticuloMetricsObserver implements IArticuloObserver {
    
    // Contadores en memoria (en producción usar Micrometer o similar)
    private long articulosCreados = 0;
    private long versionesCreadas = 0;
    private long versionesPublicadas = 0;
    private long versionesRechazadas = 0;
    private long feedbacksRecibidos = 0;
    
    @Override
    public void onArticuloEvent(ArticuloEvent evento) {
        actualizarMetricas(evento);
        
        // Log de métricas cada cierto número de eventos
        if ((articulosCreados + versionesCreadas) % 10 == 0) {
            logResumenMetricas();
        }
    }
    
    @Override
    public int getPrioridad() {
        return 50; // Prioridad media
    }
    
    @Override
    public boolean esAsincrono() {
        return true; // Se ejecuta en background
    }
    
    private synchronized void actualizarMetricas(ArticuloEvent evento) {
        switch (evento.getTipoEvento()) {
            case ARTICULO_CREADO -> articulosCreados++;
            case VERSION_CREADA -> versionesCreadas++;
            case VERSION_PUBLICADA -> versionesPublicadas++;
            case VERSION_RECHAZADA -> versionesRechazadas++;
            case FEEDBACK_RECIBIDO -> feedbacksRecibidos++;
            default -> { /* No contabilizar otros eventos */ }
        }
    }
    
    private void logResumenMetricas() {
        log.info("[KB-METRICS] Resumen: artículos={}, versiones={}, publicadas={}, rechazadas={}, feedbacks={}",
                articulosCreados,
                versionesCreadas,
                versionesPublicadas,
                versionesRechazadas,
                feedbacksRecibidos);
    }
    
    /**
     * Obtiene las métricas actuales.
     */
    public synchronized ArticuloMetrics getMetricas() {
        return new ArticuloMetrics(
                articulosCreados,
                versionesCreadas,
                versionesPublicadas,
                versionesRechazadas,
                feedbacksRecibidos,
                calcularTasaAprobacion()
        );
    }
    
    private double calcularTasaAprobacion() {
        long totalRevisadas = versionesPublicadas + versionesRechazadas;
        if (totalRevisadas == 0) return 0.0;
        return (double) versionesPublicadas / totalRevisadas * 100;
    }
    
    /**
     * DTO para las métricas de artículos.
     */
    public record ArticuloMetrics(
            long articulosCreados,
            long versionesCreadas,
            long versionesPublicadas,
            long versionesRechazadas,
            long feedbacksRecibidos,
            double tasaAprobacion
    ) {}
}
