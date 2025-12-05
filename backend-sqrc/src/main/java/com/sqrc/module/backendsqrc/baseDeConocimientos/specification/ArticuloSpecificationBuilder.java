package com.sqrc.module.backendsqrc.baseDeConocimientos.specification;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.BusquedaArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Articulo;

/**
 * Specification Pattern - Builder fluido para construir especificaciones de
 * artículos.
 * 
 * <p>
 * Permite construir especificaciones complejas de forma legible y fluida,
 * especialmente útil para convertir DTOs de búsqueda en especificaciones.
 * </p>
 * 
 * <p>
 * <b>Ejemplo de uso:</b>
 * </p>
 * 
 * <pre>
 * Specification&lt;Articulo&gt; spec = ArticuloSpecificationBuilder
 *         .crear()
 *         .conEtiqueta(Etiqueta.FAQ)
 *         .conVisibilidad(Visibilidad.PUBLICO)
 *         .soloVigentes()
 *         .conTexto("configuración")
 *         .build();
 * </pre>
 * 
 * @see Specification
 * @see ArticuloSpecifications
 */
public class ArticuloSpecificationBuilder {

    private Specification<Articulo> specification;

    private ArticuloSpecificationBuilder() {
        this.specification = Specification.alwaysTrue();
    }

    /**
     * Crea un nuevo builder.
     */
    public static ArticuloSpecificationBuilder crear() {
        return new ArticuloSpecificationBuilder();
    }

    /**
     * Crea un builder a partir de un BusquedaArticuloRequest.
     */
    public static ArticuloSpecificationBuilder desdeRequest(BusquedaArticuloRequest request) {
        ArticuloSpecificationBuilder builder = crear();

        if (request == null) {
            return builder;
        }

        // Aplicar filtros del request
        if (request.getEtiqueta() != null) {
            builder.conEtiqueta(request.getEtiqueta());
        }

        if (request.getVisibilidad() != null) {
            builder.conVisibilidad(request.getVisibilidad());
        }

        if (request.getTipoCaso() != null) {
            builder.paraTipoCaso(request.getTipoCaso());
        }

        if (request.getIdPropietario() != null) {
            builder.conPropietario(request.getIdPropietario());
        }

        if (Boolean.TRUE.equals(request.getSoloVigentes())) {
            builder.soloVigentes();
        }

        if (Boolean.TRUE.equals(request.getSoloPublicados())) {
            builder.soloPublicados();
        }

        if (request.getTexto() != null && !request.getTexto().isBlank()) {
            builder.conTexto(request.getTexto());
        }

        return builder;
    }

    // ===================== MÉTODOS DE CONSTRUCCIÓN =====================

    /**
     * Añade filtro por etiqueta.
     */
    public ArticuloSpecificationBuilder conEtiqueta(
            com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta etiqueta) {
        if (etiqueta != null) {
            this.specification = this.specification.and(ArticuloSpecifications.conEtiqueta(etiqueta));
        }
        return this;
    }

    /**
     * Añade filtro por visibilidad.
     */
    public ArticuloSpecificationBuilder conVisibilidad(
            com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad visibilidad) {
        if (visibilidad != null) {
            this.specification = this.specification.and(ArticuloSpecifications.conVisibilidad(visibilidad));
        }
        return this;
    }

    /**
     * Añade filtro por tipo de caso.
     */
    public ArticuloSpecificationBuilder paraTipoCaso(
            com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso tipoCaso) {
        if (tipoCaso != null) {
            this.specification = this.specification.and(ArticuloSpecifications.paraTipoCaso(tipoCaso));
        }
        return this;
    }

    /**
     * Añade filtro por propietario.
     */
    public ArticuloSpecificationBuilder conPropietario(Long idEmpleado) {
        if (idEmpleado != null) {
            this.specification = this.specification.and(ArticuloSpecifications.conPropietario(idEmpleado));
        }
        return this;
    }

    /**
     * Solo artículos vigentes.
     */
    public ArticuloSpecificationBuilder soloVigentes() {
        this.specification = this.specification.and(ArticuloSpecifications.estaVigente());
        return this;
    }

    /**
     * Solo artículos publicados.
     */
    public ArticuloSpecificationBuilder soloPublicados() {
        this.specification = this.specification.and(ArticuloSpecifications.tieneVersionPublicada());
        return this;
    }

    /**
     * Solo artículos con versión vigente.
     */
    public ArticuloSpecificationBuilder conVersionVigente() {
        this.specification = this.specification.and(ArticuloSpecifications.tieneVersionVigente());
        return this;
    }

    /**
     * Añade búsqueda de texto libre.
     */
    public ArticuloSpecificationBuilder conTexto(String texto) {
        if (texto != null && !texto.isBlank()) {
            this.specification = this.specification.and(ArticuloSpecifications.busquedaTextoLibre(texto));
        }
        return this;
    }

    /**
     * Añade filtro por título.
     */
    public ArticuloSpecificationBuilder tituloContiene(String texto) {
        if (texto != null && !texto.isBlank()) {
            this.specification = this.specification.and(ArticuloSpecifications.tituloContiene(texto));
        }
        return this;
    }

    /**
     * Visible para agentes.
     */
    public ArticuloSpecificationBuilder visibleParaAgentes() {
        this.specification = this.specification.and(ArticuloSpecifications.visibleParaAgente());
        return this;
    }

    /**
     * Visible para supervisores.
     */
    public ArticuloSpecificationBuilder visibleParaSupervisores() {
        this.specification = this.specification.and(ArticuloSpecifications.visibleParaSupervisor());
        return this;
    }

    /**
     * Artículos que requieren atención.
     */
    public ArticuloSpecificationBuilder requiereAtencion() {
        this.specification = this.specification.and(ArticuloSpecifications.requiereAtencion());
        return this;
    }

    // ===================== OPERADORES LÓGICOS =====================

    /**
     * Añade una especificación personalizada con AND.
     */
    public ArticuloSpecificationBuilder y(Specification<Articulo> otra) {
        if (otra != null) {
            this.specification = this.specification.and(otra);
        }
        return this;
    }

    /**
     * Añade una especificación personalizada con OR.
     */
    public ArticuloSpecificationBuilder o(Specification<Articulo> otra) {
        if (otra != null) {
            this.specification = this.specification.or(otra);
        }
        return this;
    }

    /**
     * Niega la especificación actual.
     */
    public ArticuloSpecificationBuilder negar() {
        this.specification = this.specification.not();
        return this;
    }

    // ===================== BUILD =====================

    /**
     * Construye la especificación final.
     */
    public Specification<Articulo> build() {
        return this.specification;
    }
}
