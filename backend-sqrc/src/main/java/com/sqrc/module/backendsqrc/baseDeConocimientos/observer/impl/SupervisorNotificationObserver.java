package com.sqrc.module.backendsqrc.baseDeConocimientos.observer.impl;

import org.springframework.stereotype.Component;

import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.IArticuloObserver;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent.TipoEventoArticulo;

import lombok.extern.slf4j.Slf4j;

/**
 * Observer Pattern - Observer para notificaciones de supervisores.
 * 
 * <p>Envía notificaciones a los supervisores cuando ocurren eventos
 * que requieren su atención, como versiones propuestas para revisión.</p>
 * 
 * <p>Se ejecuta de forma asíncrona para no bloquear la operación principal.</p>
 */
@Component
@Slf4j
public class SupervisorNotificationObserver implements IArticuloObserver {
    
    // TODO: Inyectar servicio de notificaciones cuando esté disponible
    // private final NotificacionService notificacionService;
    
    @Override
    public void onArticuloEvent(ArticuloEvent evento) {
        // Solo procesar eventos relevantes para supervisores
        if (!esEventoParaSupervisor(evento.getTipoEvento())) {
            return;
        }
        
        switch (evento.getTipoEvento()) {
            case VERSION_PROPUESTA -> notificarVersionPropuesta(evento);
            case VERSION_PUBLICADA -> notificarVersionPublicada(evento);
            case VERSION_RECHAZADA -> notificarVersionRechazada(evento);
            default -> { /* No notificar */ }
        }
    }
    
    @Override
    public int getPrioridad() {
        return 30; // Prioridad media-alta
    }
    
    @Override
    public boolean esAsincrono() {
        return true; // Notificaciones en background
    }
    
    private boolean esEventoParaSupervisor(TipoEventoArticulo tipo) {
        return tipo == TipoEventoArticulo.VERSION_PROPUESTA ||
               tipo == TipoEventoArticulo.VERSION_PUBLICADA ||
               tipo == TipoEventoArticulo.VERSION_RECHAZADA;
    }
    
    private void notificarVersionPropuesta(ArticuloEvent evento) {
        log.info("[KB-NOTIFY] Notificación a supervisores: Nueva versión pendiente de revisión");
        log.info("  → Artículo: {} - '{}'", evento.getCodigoArticulo(), evento.getTituloArticulo());
        log.info("  → Versión: {}", evento.getNumeroVersion());
        log.info("  → Solicitante: {}", evento.getNombreActor());
        
        // TODO: Implementar envío real de notificación
        // notificacionService.enviarASupervisores(
        //     "Nueva versión pendiente de revisión",
        //     "El artículo " + evento.getCodigoArticulo() + " tiene una nueva versión para revisar"
        // );
    }
    
    private void notificarVersionPublicada(ArticuloEvent evento) {
        log.info("[KB-NOTIFY] Notificación al autor: Versión aprobada y publicada");
        log.info("  → Artículo: {} v{}", evento.getCodigoArticulo(), evento.getNumeroVersion());
        log.info("  → Aprobador: {}", evento.getNombreActor());
        
        // TODO: Notificar al autor original que su versión fue aprobada
    }
    
    private void notificarVersionRechazada(ArticuloEvent evento) {
        log.warn("[KB-NOTIFY] Notificación al autor: Versión rechazada");
        log.warn("  → Artículo: {} v{}", evento.getCodigoArticulo(), evento.getNumeroVersion());
        log.warn("  → Revisor: {}", evento.getNombreActor());
        log.warn("  → Motivo: {}", evento.getDatosAdicionales() != null ? 
                evento.getDatosAdicionales() : "Sin motivo especificado");
        
        // TODO: Notificar al autor que su versión fue rechazada con el motivo
    }
}
