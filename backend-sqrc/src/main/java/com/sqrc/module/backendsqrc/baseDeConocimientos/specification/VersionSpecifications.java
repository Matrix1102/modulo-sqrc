package com.sqrc.module.backendsqrc.baseDeConocimientos.specification;

import java.time.LocalDateTime;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.OrigenVersion;

/**
 * Specification Pattern - Factory con especificaciones predefinidas para Versiones de Artículos.
 * 
 * <p>Proporciona métodos estáticos para crear especificaciones de versiones
 * que pueden combinarse de forma fluida.</p>
 * 
 * @see Specification
 * @see ArticuloSpecifications
 */
public final class VersionSpecifications {
    
    private VersionSpecifications() {
        // Clase utilitaria - no instanciable
    }
    
    // ===================== ESPECIFICACIONES DE ESTADO =====================
    
    /**
     * Versiones con un estado específico.
     */
    public static Specification<ArticuloVersion> conEstado(EstadoArticulo estado) {
        if (estado == null) {
            return Specification.alwaysTrue();
        }
        return version -> version.getEstadoPropuesta() == estado;
    }
    
    /**
     * Versiones en estado borrador.
     */
    public static Specification<ArticuloVersion> esBorrador() {
        return conEstado(EstadoArticulo.BORRADOR);
    }
    
    /**
     * Versiones propuestas para revisión.
     */
    public static Specification<ArticuloVersion> estaPropuesta() {
        return conEstado(EstadoArticulo.PROPUESTO);
    }
    
    /**
     * Versiones publicadas.
     */
    public static Specification<ArticuloVersion> estaPublicada() {
        return conEstado(EstadoArticulo.PUBLICADO);
    }
    
    /**
     * Versiones rechazadas.
     */
    public static Specification<ArticuloVersion> estaRechazada() {
        return conEstado(EstadoArticulo.RECHAZADO);
    }
    
    /**
     * Versiones archivadas.
     */
    public static Specification<ArticuloVersion> estaArchivada() {
        return conEstado(EstadoArticulo.ARCHIVADO);
    }
    
    /**
     * Versiones deprecadas.
     */
    public static Specification<ArticuloVersion> estaDeprecada() {
        return conEstado(EstadoArticulo.DEPRECADO);
    }
    
    // ===================== ESPECIFICACIONES DE VIGENCIA =====================
    
    /**
     * Versiones marcadas como vigentes.
     */
    public static Specification<ArticuloVersion> esVigente() {
        return version -> Boolean.TRUE.equals(version.getEsVigente());
    }
    
    /**
     * Versiones no vigentes.
     */
    public static Specification<ArticuloVersion> noEsVigente() {
        return version -> !Boolean.TRUE.equals(version.getEsVigente());
    }
    
    // ===================== ESPECIFICACIONES DE ORIGEN =====================
    
    /**
     * Versiones con un origen específico.
     */
    public static Specification<ArticuloVersion> conOrigen(OrigenVersion origen) {
        if (origen == null) {
            return Specification.alwaysTrue();
        }
        return version -> version.getOrigen() == origen;
    }
    
    /**
     * Versiones creadas manualmente.
     */
    public static Specification<ArticuloVersion> esManual() {
        return conOrigen(OrigenVersion.MANUAL);
    }
    
    /**
     * Versiones derivadas de documentación.
     */
    public static Specification<ArticuloVersion> esDerivadaDeDocumentacion() {
        return conOrigen(OrigenVersion.DERIVADO_DE_DOCUMENTACION);
    }
    
    /**
     * Versiones generadas desde documento subido.
     */
    public static Specification<ArticuloVersion> esDeDocumentoSubido() {
        return conOrigen(OrigenVersion.DOCUMENTO_SUBIDO);
    }
    
    /**
     * Versiones generadas desde tema libre.
     */
    public static Specification<ArticuloVersion> esDeTemaLibre() {
        return conOrigen(OrigenVersion.TEMA_LIBRE);
    }
    
    /**
     * Versiones generadas por IA (cualquier origen excepto MANUAL).
     */
    public static Specification<ArticuloVersion> esGeneradaPorIA() {
        return version -> version.getOrigen() != null && 
                         version.getOrigen() != OrigenVersion.MANUAL;
    }
    
    // ===================== ESPECIFICACIONES DE CREADOR =====================
    
    /**
     * Versiones creadas por un empleado específico.
     */
    public static Specification<ArticuloVersion> creadaPor(Long idEmpleado) {
        if (idEmpleado == null) {
            return Specification.alwaysTrue();
        }
        return version -> version.getCreadoPor() != null &&
                         version.getCreadoPor().getIdEmpleado().equals(idEmpleado);
    }
    
    // ===================== ESPECIFICACIONES DE FECHA =====================
    
    /**
     * Versiones creadas después de una fecha.
     */
    public static Specification<ArticuloVersion> creadaDespuesDe(LocalDateTime fecha) {
        if (fecha == null) {
            return Specification.alwaysTrue();
        }
        return version -> version.getCreadoEn() != null &&
                         version.getCreadoEn().isAfter(fecha);
    }
    
    /**
     * Versiones creadas antes de una fecha.
     */
    public static Specification<ArticuloVersion> creadaAntesDe(LocalDateTime fecha) {
        if (fecha == null) {
            return Specification.alwaysTrue();
        }
        return version -> version.getCreadoEn() != null &&
                         version.getCreadoEn().isBefore(fecha);
    }
    
    /**
     * Versiones creadas en un rango de fechas.
     */
    public static Specification<ArticuloVersion> creadaEntre(LocalDateTime desde, LocalDateTime hasta) {
        return creadaDespuesDe(desde).and(creadaAntesDe(hasta));
    }
    
    // ===================== ESPECIFICACIONES DE CONTENIDO =====================
    
    /**
     * Versiones cuyo contenido contiene el texto.
     */
    public static Specification<ArticuloVersion> contenidoContiene(String texto) {
        if (texto == null || texto.isBlank()) {
            return Specification.alwaysTrue();
        }
        String textoLower = texto.toLowerCase().trim();
        return version -> version.getContenido() != null &&
                         version.getContenido().toLowerCase().contains(textoLower);
    }
    
    /**
     * Versiones con un número de versión específico.
     */
    public static Specification<ArticuloVersion> conNumeroVersion(int numero) {
        return version -> version.getNumeroVersion() == numero;
    }
    
    /**
     * Versiones con ticket de origen asociado.
     */
    public static Specification<ArticuloVersion> tieneTicketOrigen() {
        return version -> version.getTicketOrigen() != null;
    }
    
    /**
     * Versiones de un ticket específico.
     */
    public static Specification<ArticuloVersion> deTicket(Long idTicket) {
        if (idTicket == null) {
            return Specification.alwaysTrue();
        }
        return version -> version.getTicketOrigen() != null &&
                         version.getTicketOrigen().getIdTicket().equals(idTicket);
    }
    
    // ===================== ESPECIFICACIONES COMPUESTAS =====================
    
    /**
     * Versiones pendientes de revisión (propuestas).
     */
    public static Specification<ArticuloVersion> pendienteDeRevision() {
        return estaPropuesta();
    }
    
    /**
     * Versiones activas (publicadas y vigentes).
     */
    public static Specification<ArticuloVersion> estaActiva() {
        return estaPublicada().and(esVigente());
    }
    
    /**
     * Versiones editables (borradores o rechazadas).
     */
    public static Specification<ArticuloVersion> esEditable() {
        return esBorrador().or(estaRechazada());
    }
}
