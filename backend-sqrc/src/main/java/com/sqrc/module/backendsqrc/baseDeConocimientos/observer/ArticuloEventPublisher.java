package com.sqrc.module.backendsqrc.baseDeConocimientos.observer;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event.ArticuloEvent;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * Observer Pattern - Subject/Publisher que gestiona la notificación de eventos.
 * 
 * <p>Implementa el patrón Observer como Subject, manteniendo una lista de
 * observadores y notificándolos cuando ocurren eventos de artículos.</p>
 * 
 * <p><b>Características:</b></p>
 * <ul>
 *   <li>Thread-safe usando CopyOnWriteArrayList</li>
 *   <li>Soporte para observers síncronos y asíncronos</li>
 *   <li>Ordenamiento por prioridad</li>
 *   <li>Auto-registro de observers mediante inyección de Spring</li>
 * </ul>
 * 
 * @see IArticuloObserver
 * @see ArticuloEvent
 */
@Component
@Slf4j
public class ArticuloEventPublisher {
    
    /** Lista thread-safe de observers registrados */
    private final CopyOnWriteArrayList<IArticuloObserver> observers = new CopyOnWriteArrayList<>();
    
    /** Lista de observers inyectados por Spring */
    private final List<IArticuloObserver> springObservers;
    
    public ArticuloEventPublisher(List<IArticuloObserver> springObservers) {
        this.springObservers = springObservers != null ? springObservers : new ArrayList<>();
    }
    
    /**
     * Registra automáticamente los observers inyectados por Spring al iniciar.
     */
    @PostConstruct
    public void init() {
        if (!springObservers.isEmpty()) {
            springObservers.forEach(this::registrar);
            log.info("Observer Pattern: {} observers registrados automáticamente", observers.size());
        }
    }
    
    /**
     * Registra un nuevo observer.
     * 
     * @param observer El observer a registrar
     */
    public void registrar(IArticuloObserver observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
            log.debug("Observer registrado: {}", observer.getClass().getSimpleName());
        }
    }
    
    /**
     * Elimina un observer del registro.
     * 
     * @param observer El observer a eliminar
     */
    public void eliminar(IArticuloObserver observer) {
        if (observer != null) {
            observers.remove(observer);
            log.debug("Observer eliminado: {}", observer.getClass().getSimpleName());
        }
    }
    
    /**
     * Publica un evento a todos los observers registrados.
     * Los observers síncronos se ejecutan en orden de prioridad.
     * Los observers asíncronos se ejecutan en paralelo.
     * 
     * @param evento El evento a publicar
     */
    public void publicar(ArticuloEvent evento) {
        if (evento == null) {
            log.warn("Intento de publicar evento nulo");
            return;
        }
        
        log.info("Publicando evento: {}", evento);
        
        // Separar observers síncronos y asíncronos
        List<IArticuloObserver> sincronos = new ArrayList<>();
        List<IArticuloObserver> asincronos = new ArrayList<>();
        
        for (IArticuloObserver observer : observers) {
            if (observer.esAsincrono()) {
                asincronos.add(observer);
            } else {
                sincronos.add(observer);
            }
        }
        
        // Ejecutar observers síncronos en orden de prioridad
        sincronos.stream()
                .sorted(Comparator.comparingInt(IArticuloObserver::getPrioridad))
                .forEach(observer -> ejecutarObserverSincrono(observer, evento));
        
        // Ejecutar observers asíncronos en paralelo
        asincronos.forEach(observer -> ejecutarObserverAsincrono(observer, evento));
    }
    
    /**
     * Ejecuta un observer de forma síncrona con manejo de errores.
     */
    private void ejecutarObserverSincrono(IArticuloObserver observer, ArticuloEvent evento) {
        try {
            observer.onArticuloEvent(evento);
        } catch (Exception e) {
            log.error("Error en observer síncrono {}: {}", 
                    observer.getClass().getSimpleName(), e.getMessage(), e);
        }
    }
    
    /**
     * Ejecuta un observer de forma asíncrona.
     */
    @Async
    protected void ejecutarObserverAsincrono(IArticuloObserver observer, ArticuloEvent evento) {
        CompletableFuture.runAsync(() -> {
            try {
                observer.onArticuloEvent(evento);
            } catch (Exception e) {
                log.error("Error en observer asíncrono {}: {}", 
                        observer.getClass().getSimpleName(), e.getMessage(), e);
            }
        });
    }
    
    /**
     * Obtiene el número de observers registrados.
     */
    public int getCantidadObservers() {
        return observers.size();
    }
    
    /**
     * Limpia todos los observers (útil para testing).
     */
    public void limpiarObservers() {
        observers.clear();
        log.debug("Todos los observers han sido eliminados");
    }
}
