package com.sqrc.module.backendsqrc.baseDeConocimientos.observer.impl;

import org.springframework.stereotype.Component;

import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.IArticuloObserver;
import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent;

import lombok.extern.slf4j.Slf4j;

/**
 * Observer Pattern - Observer para logging de eventos de artículos.
 * 
 * <p>Registra todos los eventos de artículos en el log del sistema
 * para auditoría y debugging.</p>
 * 
 * <p>Este observer tiene alta prioridad (10) para asegurar que los eventos
 * se registren antes de cualquier otra acción.</p>
 */
@Component
@Slf4j
public class ArticuloLoggingObserver implements IArticuloObserver {
    
    @Override
    public void onArticuloEvent(ArticuloEvent evento) {
        switch (evento.getTipoEvento()) {
            case ARTICULO_CREADO -> logArticuloCreado(evento);
            case VERSION_CREADA -> logVersionCreada(evento);
            case VERSION_PROPUESTA -> logVersionPropuesta(evento);
            case VERSION_PUBLICADA -> logVersionPublicada(evento);
            case VERSION_RECHAZADA -> logVersionRechazada(evento);
            case VERSION_ARCHIVADA -> logVersionArchivada(evento);
            case ARTICULO_ACTUALIZADO -> logArticuloActualizado(evento);
            case FEEDBACK_RECIBIDO -> logFeedbackRecibido(evento);
            case ARTICULO_ELIMINADO -> logArticuloEliminado(evento);
        }
    }
    
    @Override
    public int getPrioridad() {
        return 10; // Alta prioridad - se ejecuta primero
    }
    
    private void logArticuloCreado(ArticuloEvent evento) {
        log.info("[KB-EVENT] Artículo CREADO: {} - '{}' por {} | Versión inicial: {}",
                evento.getCodigoArticulo(),
                evento.getTituloArticulo(),
                evento.getNombreActor(),
                evento.getNumeroVersion());
    }
    
    private void logVersionCreada(ArticuloEvent evento) {
        log.info("[KB-EVENT] Nueva VERSIÓN creada: {} v{} por {}",
                evento.getCodigoArticulo(),
                evento.getNumeroVersion(),
                evento.getNombreActor());
    }
    
    private void logVersionPropuesta(ArticuloEvent evento) {
        log.info("[KB-EVENT] Versión PROPUESTA para revisión: {} v{} por {}",
                evento.getCodigoArticulo(),
                evento.getNumeroVersion(),
                evento.getNombreActor());
    }
    
    private void logVersionPublicada(ArticuloEvent evento) {
        log.info("[KB-EVENT] Versión PUBLICADA: {} v{} aprobada por {}",
                evento.getCodigoArticulo(),
                evento.getNumeroVersion(),
                evento.getNombreActor());
    }
    
    private void logVersionRechazada(ArticuloEvent evento) {
        log.warn("[KB-EVENT] Versión RECHAZADA: {} v{} por {} | Motivo: {}",
                evento.getCodigoArticulo(),
                evento.getNumeroVersion(),
                evento.getNombreActor(),
                evento.getDatosAdicionales() != null ? evento.getDatosAdicionales() : "Sin motivo");
    }
    
    private void logVersionArchivada(ArticuloEvent evento) {
        log.info("[KB-EVENT] Versión ARCHIVADA: {} v{} por {}",
                evento.getCodigoArticulo(),
                evento.getNumeroVersion(),
                evento.getNombreActor());
    }
    
    private void logArticuloActualizado(ArticuloEvent evento) {
        log.info("[KB-EVENT] Artículo ACTUALIZADO: {} por {}",
                evento.getCodigoArticulo(),
                evento.getNombreActor());
    }
    
    private void logFeedbackRecibido(ArticuloEvent evento) {
        log.info("[KB-EVENT] FEEDBACK recibido en: {} v{} de {}",
                evento.getCodigoArticulo(),
                evento.getNumeroVersion(),
                evento.getNombreActor());
    }
    
    private void logArticuloEliminado(ArticuloEvent evento) {
        log.warn("[KB-EVENT] Artículo ELIMINADO: {} por {}",
                evento.getCodigoArticulo(),
                evento.getNombreActor());
    }
}
