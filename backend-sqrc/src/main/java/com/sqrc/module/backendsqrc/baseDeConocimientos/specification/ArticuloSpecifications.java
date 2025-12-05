package com.sqrc.module.backendsqrc.baseDeConocimientos.specification;

import java.time.LocalDateTime;

import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Articulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.EstadoArticulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;

/**
 * Specification Pattern - Factory con especificaciones predefinidas para
 * Artículos.
 * 
 * <p>
 * Proporciona métodos estáticos para crear especificaciones comunes
 * que pueden combinarse de forma fluida.
 * </p>
 * 
 * <p>
 * <b>Ejemplo de uso:</b>
 * </p>
 * 
 * <pre>
 * Specification&lt;Articulo&gt; spec = ArticuloSpecifications
 *         .conEtiqueta(Etiqueta.TROUBLESHOOTING)
 *         .and(ArticuloSpecifications.estaVigente())
 *         .and(ArticuloSpecifications.conVisibilidad(Visibilidad.PUBLICO));
 * 
 * List&lt;Articulo&gt; filtrados = articulos.stream()
 *         .filter(spec::isSatisfiedBy)
 *         .collect(Collectors.toList());
 * </pre>
 * 
 * @see Specification
 */
public final class ArticuloSpecifications {

    private ArticuloSpecifications() {
        // Clase utilitaria - no instanciable
    }

    // ===================== ESPECIFICACIONES DE ETIQUETA/CATEGORÍA
    // =====================

    /**
     * Artículos con una etiqueta específica.
     */
    public static Specification<Articulo> conEtiqueta(Etiqueta etiqueta) {
        if (etiqueta == null) {
            return Specification.alwaysTrue();
        }
        return articulo -> articulo.getEtiqueta() == etiqueta;
    }

    /**
     * Artículos de troubleshooting.
     */
    public static Specification<Articulo> esTroubleshooting() {
        return conEtiqueta(Etiqueta.TROUBLESHOOTING);
    }

    /**
     * Artículos de FAQ (preguntas frecuentes).
     */
    public static Specification<Articulo> esFAQs() {
        return conEtiqueta(Etiqueta.FAQS);
    }

    /**
     * Artículos de guías de procedimiento.
     */
    public static Specification<Articulo> esGuia() {
        return conEtiqueta(Etiqueta.GUIAS);
    }

    /**
     * Artículos de instructivos paso a paso.
     */
    public static Specification<Articulo> esInstructivo() {
        return conEtiqueta(Etiqueta.INSTRUCTIVOS);
    }

    // ===================== ESPECIFICACIONES DE VISIBILIDAD =====================

    /**
     * Artículos con una visibilidad específica.
     */
    public static Specification<Articulo> conVisibilidad(Visibilidad visibilidad) {
        if (visibilidad == null) {
            return Specification.alwaysTrue();
        }
        return articulo -> articulo.getVisibilidad() == visibilidad;
    }

    /**
     * Artículos visibles para agentes (visibilidad AGENTE o SUPERVISOR).
     * Agentes pueden ver todo lo que tiene visibilidad de agente.
     */
    public static Specification<Articulo> visibleParaAgente() {
        return articulo -> articulo.getVisibilidad() == Visibilidad.AGENTE;
    }

    /**
     * Artículos visibles solo para supervisores.
     */
    public static Specification<Articulo> visibleParaSupervisor() {
        return conVisibilidad(Visibilidad.SUPERVISOR);
    }

    /**
     * Artículos que un agente puede ver (AGENTE solamente).
     */
    public static Specification<Articulo> esVisibilidadAgente() {
        return conVisibilidad(Visibilidad.AGENTE);
    }

    // ===================== ESPECIFICACIONES DE TIPO DE CASO =====================

    /**
     * Artículos para un tipo de caso específico.
     */
    public static Specification<Articulo> paraTipoCaso(TipoCaso tipoCaso) {
        if (tipoCaso == null) {
            return Specification.alwaysTrue();
        }
        return articulo -> articulo.getTipoCaso() == tipoCaso ||
                articulo.getTipoCaso() == TipoCaso.TODOS;
    }

    /**
     * Artículos aplicables a todos los tipos de caso.
     */
    public static Specification<Articulo> paraTodosTipos() {
        return articulo -> articulo.getTipoCaso() == TipoCaso.TODOS;
    }

    // ===================== ESPECIFICACIONES DE VIGENCIA =====================

    /**
     * Artículos vigentes en la fecha actual.
     */
    public static Specification<Articulo> estaVigente() {
        return estaVigenteEn(LocalDateTime.now());
    }

    /**
     * Artículos vigentes en una fecha específica.
     */
    public static Specification<Articulo> estaVigenteEn(LocalDateTime fecha) {
        return articulo -> {
            if (articulo.getVigenteDesde() == null) {
                return true;
            }
            boolean despuesDeInicio = !fecha.isBefore(articulo.getVigenteDesde());
            boolean antesDeExpiracion = articulo.getVigenteHasta() == null ||
                    !fecha.isAfter(articulo.getVigenteHasta());
            return despuesDeInicio && antesDeExpiracion;
        };
    }

    /**
     * Artículos expirados (ya no vigentes).
     */
    public static Specification<Articulo> estaExpirado() {
        return articulo -> articulo.getVigenteHasta() != null &&
                LocalDateTime.now().isAfter(articulo.getVigenteHasta());
    }

    // ===================== ESPECIFICACIONES DE PROPIETARIO =====================

    /**
     * Artículos de un propietario específico.
     */
    public static Specification<Articulo> conPropietario(Long idEmpleado) {
        if (idEmpleado == null) {
            return Specification.alwaysTrue();
        }
        return articulo -> articulo.getPropietario() != null &&
                articulo.getPropietario().getIdEmpleado().equals(idEmpleado);
    }

    // ===================== ESPECIFICACIONES DE VERSIÓN =====================

    /**
     * Artículos que tienen al menos una versión publicada.
     */
    public static Specification<Articulo> tieneVersionPublicada() {
        return articulo -> articulo.getVersiones() != null &&
                articulo.getVersiones().stream()
                        .anyMatch(v -> v.getEstadoPropuesta() == EstadoArticulo.PUBLICADO);
    }

    /**
     * Artículos con versión vigente (esVigente = true).
     */
    public static Specification<Articulo> tieneVersionVigente() {
        return articulo -> articulo.getVersionVigente() != null;
    }

    /**
     * Artículos con versiones en borrador.
     */
    public static Specification<Articulo> tieneVersionEnBorrador() {
        return articulo -> articulo.getVersiones() != null &&
                articulo.getVersiones().stream()
                        .anyMatch(v -> v.getEstadoPropuesta() == EstadoArticulo.BORRADOR);
    }

    /**
     * Artículos con versiones pendientes de revisión.
     */
    public static Specification<Articulo> tieneVersionPropuesta() {
        return articulo -> articulo.getVersiones() != null &&
                articulo.getVersiones().stream()
                        .anyMatch(v -> v.getEstadoPropuesta() == EstadoArticulo.PROPUESTO);
    }

    // ===================== ESPECIFICACIONES DE BÚSQUEDA DE TEXTO
    // =====================

    /**
     * Artículos cuyo título contiene el texto (case-insensitive).
     */
    public static Specification<Articulo> tituloContiene(String texto) {
        if (texto == null || texto.isBlank()) {
            return Specification.alwaysTrue();
        }
        String textoLower = texto.toLowerCase().trim();
        return articulo -> articulo.getTitulo() != null &&
                articulo.getTitulo().toLowerCase().contains(textoLower);
    }

    /**
     * Artículos cuyo resumen contiene el texto (case-insensitive).
     */
    public static Specification<Articulo> resumenContiene(String texto) {
        if (texto == null || texto.isBlank()) {
            return Specification.alwaysTrue();
        }
        String textoLower = texto.toLowerCase().trim();
        return articulo -> articulo.getResumen() != null &&
                articulo.getResumen().toLowerCase().contains(textoLower);
    }

    /**
     * Artículos cuyos tags contienen el texto (case-insensitive).
     */
    public static Specification<Articulo> tagsContiene(String texto) {
        if (texto == null || texto.isBlank()) {
            return Specification.alwaysTrue();
        }
        String textoLower = texto.toLowerCase().trim();
        return articulo -> articulo.getTags() != null &&
                articulo.getTags().toLowerCase().contains(textoLower);
    }

    /**
     * Artículos cuyo código coincide exactamente (case-insensitive).
     */
    public static Specification<Articulo> conCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return Specification.alwaysTrue();
        }
        String codigoLower = codigo.toLowerCase().trim();
        return articulo -> articulo.getCodigo() != null &&
                articulo.getCodigo().toLowerCase().equals(codigoLower);
    }

    /**
     * Búsqueda de texto libre en título, resumen y tags.
     */
    public static Specification<Articulo> busquedaTextoLibre(String texto) {
        if (texto == null || texto.isBlank()) {
            return Specification.alwaysTrue();
        }
        return tituloContiene(texto)
                .or(resumenContiene(texto))
                .or(tagsContiene(texto));
    }

    // ===================== ESPECIFICACIONES COMPUESTAS PREDEFINIDAS
    // =====================

    /**
     * Artículos publicados y vigentes visibles para agentes.
     * Útil para mostrar artículos en la KB para agentes.
     */
    public static Specification<Articulo> disponibleParaAgentes() {
        return tieneVersionPublicada()
                .and(estaVigente())
                .and(visibleParaAgente());
    }

    /**
     * Artículos publicados y vigentes visibles para supervisores.
     * Supervisores pueden ver tanto artículos AGENTE como SUPERVISOR.
     */
    public static Specification<Articulo> disponibleParaSupervisores() {
        return tieneVersionPublicada()
                .and(estaVigente());
    }

    /**
     * Artículos que necesitan atención (borradores o propuestos).
     */
    public static Specification<Articulo> requiereAtencion() {
        return tieneVersionEnBorrador().or(tieneVersionPropuesta());
    }
}
