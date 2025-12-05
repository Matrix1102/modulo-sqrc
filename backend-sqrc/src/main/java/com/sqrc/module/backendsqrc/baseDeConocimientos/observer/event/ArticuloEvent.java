package com.sqrc.module.backendsqrc.baseDeConocimientos.observer.event;

import java.time.LocalDateTime;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Articulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;

import lombok.Getter;

/**
 * Observer Pattern - Clase base para eventos de artículos.
 * 
 * <p>Encapsula la información común de todos los eventos relacionados
 * con artículos de la base de conocimiento.</p>
 * 
 * @see TipoEventoArticulo
 * @see ArticuloEventPublisher
 */
@Getter
public class ArticuloEvent {
    
    /**
     * Tipos de eventos soportados para artículos.
     */
    public enum TipoEventoArticulo {
        /** Artículo creado (con versión inicial) */
        ARTICULO_CREADO,
        
        /** Nueva versión creada para un artículo existente */
        VERSION_CREADA,
        
        /** Versión propuesta para revisión del supervisor */
        VERSION_PROPUESTA,
        
        /** Versión publicada y visible para agentes */
        VERSION_PUBLICADA,
        
        /** Versión rechazada por el supervisor */
        VERSION_RECHAZADA,
        
        /** Versión archivada (reemplazada por nueva versión) */
        VERSION_ARCHIVADA,
        
        /** Artículo eliminado */
        ARTICULO_ELIMINADO,
        
        /** Artículo actualizado (metadatos) */
        ARTICULO_ACTUALIZADO,
        
        /** Feedback recibido en un artículo */
        FEEDBACK_RECIBIDO
    }
    
    /** Tipo de evento */
    private final TipoEventoArticulo tipoEvento;
    
    /** Artículo relacionado con el evento */
    private final Articulo articulo;
    
    /** Versión específica (puede ser null para eventos de artículo) */
    private final ArticuloVersion version;
    
    /** Empleado que generó el evento */
    private final Empleado actor;
    
    /** Momento en que ocurrió el evento */
    private final LocalDateTime timestamp;
    
    /** Datos adicionales del evento (JSON) */
    private final String datosAdicionales;
    
    /**
     * Constructor privado. Usar los factory methods.
     */
    private ArticuloEvent(TipoEventoArticulo tipoEvento, Articulo articulo, 
                          ArticuloVersion version, Empleado actor, String datosAdicionales) {
        this.tipoEvento = tipoEvento;
        this.articulo = articulo;
        this.version = version;
        this.actor = actor;
        this.timestamp = LocalDateTime.now();
        this.datosAdicionales = datosAdicionales;
    }
    
    // ===================== FACTORY METHODS =====================
    
    /**
     * Crea un evento de artículo creado.
     */
    public static ArticuloEvent articuloCreado(Articulo articulo, ArticuloVersion versionInicial, Empleado creador) {
        return new ArticuloEvent(
                TipoEventoArticulo.ARTICULO_CREADO,
                articulo,
                versionInicial,
                creador,
                null
        );
    }
    
    /**
     * Crea un evento de nueva versión creada.
     */
    public static ArticuloEvent versionCreada(Articulo articulo, ArticuloVersion version, Empleado creador) {
        return new ArticuloEvent(
                TipoEventoArticulo.VERSION_CREADA,
                articulo,
                version,
                creador,
                null
        );
    }
    
    /**
     * Crea un evento de versión propuesta para revisión.
     */
    public static ArticuloEvent versionPropuesta(Articulo articulo, ArticuloVersion version, Empleado solicitante) {
        return new ArticuloEvent(
                TipoEventoArticulo.VERSION_PROPUESTA,
                articulo,
                version,
                solicitante,
                null
        );
    }
    
    /**
     * Crea un evento de versión publicada.
     */
    public static ArticuloEvent versionPublicada(Articulo articulo, ArticuloVersion version, Empleado aprobador) {
        return new ArticuloEvent(
                TipoEventoArticulo.VERSION_PUBLICADA,
                articulo,
                version,
                aprobador,
                null
        );
    }
    
    /**
     * Crea un evento de versión rechazada.
     */
    public static ArticuloEvent versionRechazada(Articulo articulo, ArticuloVersion version, 
                                                  Empleado revisor, String motivo) {
        return new ArticuloEvent(
                TipoEventoArticulo.VERSION_RECHAZADA,
                articulo,
                version,
                revisor,
                motivo
        );
    }
    
    /**
     * Crea un evento de versión archivada.
     */
    public static ArticuloEvent versionArchivada(Articulo articulo, ArticuloVersion version, Empleado actor) {
        return new ArticuloEvent(
                TipoEventoArticulo.VERSION_ARCHIVADA,
                articulo,
                version,
                actor,
                null
        );
    }
    
    /**
     * Crea un evento de artículo actualizado.
     */
    public static ArticuloEvent articuloActualizado(Articulo articulo, Empleado editor) {
        return new ArticuloEvent(
                TipoEventoArticulo.ARTICULO_ACTUALIZADO,
                articulo,
                null,
                editor,
                null
        );
    }
    
    /**
     * Crea un evento de feedback recibido.
     */
    public static ArticuloEvent feedbackRecibido(Articulo articulo, ArticuloVersion version, 
                                                  Empleado agente, String datosFeedback) {
        return new ArticuloEvent(
                TipoEventoArticulo.FEEDBACK_RECIBIDO,
                articulo,
                version,
                agente,
                datosFeedback
        );
    }
    
    // ===================== MÉTODOS ÚTILES =====================
    
    /**
     * Obtiene el código del artículo de forma segura.
     */
    public String getCodigoArticulo() {
        return articulo != null ? articulo.getCodigo() : "N/A";
    }
    
    /**
     * Obtiene el título del artículo de forma segura.
     */
    public String getTituloArticulo() {
        return articulo != null ? articulo.getTitulo() : "N/A";
    }
    
    /**
     * Obtiene el número de versión de forma segura.
     */
    public Integer getNumeroVersion() {
        return version != null ? version.getNumeroVersion() : null;
    }
    
    /**
     * Obtiene el nombre del actor de forma segura.
     */
    public String getNombreActor() {
        return actor != null ? actor.getNombre() + " " + actor.getApellido() : "Sistema";
    }
    
    @Override
    public String toString() {
        return String.format("ArticuloEvent[tipo=%s, articulo=%s, version=%s, actor=%s, timestamp=%s]",
                tipoEvento,
                getCodigoArticulo(),
                getNumeroVersion(),
                getNombreActor(),
                timestamp);
    }
}
