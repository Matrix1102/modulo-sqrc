package com.sqrc.module.backendsqrc.baseDeConocimientos.specification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.BusquedaArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Articulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Specification Pattern - Servicio para aplicar especificaciones a artículos.
 * 
 * <p>
 * Proporciona métodos para filtrar artículos usando el patrón Specification,
 * permitiendo consultas flexibles y reutilizables.
 * </p>
 * 
 * <p>
 * <b>Ejemplo de uso:</b>
 * </p>
 * 
 * <pre>
 * // Usando el builder
 * List&lt;Articulo&gt; resultados = specService.filtrar(
 *         ArticuloSpecificationBuilder.crear()
 *                 .conEtiqueta(Etiqueta.FAQ)
 *                 .soloPublicados()
 *                 .build());
 * 
 * // Desde un request
 * List&lt;Articulo&gt; resultados = specService.filtrarDesdeRequest(busquedaRequest);
 * </pre>
 * 
 * @see Specification
 * @see ArticuloSpecifications
 * @see ArticuloSpecificationBuilder
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ArticuloSpecificationService {

    private final ArticuloRepository articuloRepository;

    /**
     * Filtra todos los artículos usando una especificación.
     * 
     * @param spec La especificación a aplicar
     * @return Lista de artículos que satisfacen la especificación
     */
    public List<Articulo> filtrar(Specification<Articulo> spec) {
        log.debug("Aplicando Specification Pattern para filtrar artículos");

        List<Articulo> todos = articuloRepository.findAll();

        return todos.stream()
                .filter(spec::isSatisfiedBy)
                .collect(Collectors.toList());
    }

    /**
     * Filtra artículos desde un BusquedaArticuloRequest.
     * Convierte automáticamente el request en una especificación.
     * 
     * @param request El request de búsqueda
     * @return Lista de artículos que satisfacen los criterios
     */
    public List<Articulo> filtrarDesdeRequest(BusquedaArticuloRequest request) {
        Specification<Articulo> spec = ArticuloSpecificationBuilder
                .desdeRequest(request)
                .build();

        log.debug("Filtrar desde request: {}", request);
        return filtrar(spec);
    }

    /**
     * Obtiene artículos disponibles para agentes.
     * (Publicados, vigentes, y con visibilidad para agentes)
     */
    public List<Articulo> obtenerDisponiblesParaAgentes() {
        return filtrar(ArticuloSpecifications.disponibleParaAgentes());
    }

    /**
     * Obtiene artículos disponibles para supervisores.
     * (Publicados, vigentes, supervisores pueden ver todo)
     */
    public List<Articulo> obtenerDisponiblesParaSupervisores() {
        return filtrar(ArticuloSpecifications.disponibleParaSupervisores());
    }

    /**
     * Obtiene artículos que requieren atención (borradores o propuestos).
     */
    public List<Articulo> obtenerRequierenAtencion() {
        return filtrar(ArticuloSpecifications.requiereAtencion());
    }

    /**
     * Obtiene artículos expirados.
     */
    public List<Articulo> obtenerExpirados() {
        return filtrar(ArticuloSpecifications.estaExpirado());
    }

    /**
     * Cuenta cuántos artículos satisfacen una especificación.
     */
    public long contar(Specification<Articulo> spec) {
        return articuloRepository.findAll().stream()
                .filter(spec::isSatisfiedBy)
                .count();
    }

    /**
     * Verifica si existe al menos un artículo que satisfaga la especificación.
     */
    public boolean existe(Specification<Articulo> spec) {
        return articuloRepository.findAll().stream()
                .anyMatch(spec::isSatisfiedBy);
    }

    /**
     * Obtiene el primer artículo que satisfaga la especificación.
     */
    public Articulo obtenerPrimero(Specification<Articulo> spec) {
        return articuloRepository.findAll().stream()
                .filter(spec::isSatisfiedBy)
                .findFirst()
                .orElse(null);
    }
}
