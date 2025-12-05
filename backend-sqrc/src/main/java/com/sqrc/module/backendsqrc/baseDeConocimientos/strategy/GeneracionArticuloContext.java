package com.sqrc.module.backendsqrc.baseDeConocimientos.strategy;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.GeneracionArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.OperacionInvalidaException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Context del patrón Strategy para la generación de artículos con IA.
 * 
 * Este componente orquesta las diferentes estrategias de generación,
 * seleccionando automáticamente la más adecuada según el tipo de solicitud.
 * 
 * Responsabilidades:
 * - Mantener registro de todas las estrategias disponibles
 * - Seleccionar la estrategia correcta según la solicitud
 * - Delegar la generación a la estrategia seleccionada
 * - Proporcionar información sobre estrategias disponibles
 */
@Component
@Slf4j
public class GeneracionArticuloContext {

    private final List<GeneracionArticuloStrategy> estrategias;
    private final Map<String, GeneracionArticuloStrategy> estrategiasPorNombre;

    /**
     * Constructor que inyecta todas las estrategias registradas.
     * Spring inyecta automáticamente todas las implementaciones de
     * GeneracionArticuloStrategy.
     */
    public GeneracionArticuloContext(List<GeneracionArticuloStrategy> estrategias) {
        this.estrategias = estrategias;
        this.estrategiasPorNombre = estrategias.stream()
                .collect(Collectors.toMap(
                        GeneracionArticuloStrategy::getNombre,
                        s -> s));

        log.info("GeneracionArticuloContext inicializado con {} estrategias: {}",
                estrategias.size(),
                estrategias.stream()
                        .map(GeneracionArticuloStrategy::getNombre)
                        .collect(Collectors.joining(", ")));
    }

    /**
     * Genera un artículo usando la estrategia apropiada según la solicitud.
     * 
     * @param request Solicitud de generación
     * @return Artículo generado
     * @throws OperacionInvalidaException si no hay estrategia que soporte la
     *                                    solicitud
     */
    public ArticuloGeneradoIA generarArticulo(GeneracionArticuloRequest request) {
        GeneracionArticuloStrategy estrategia = seleccionarEstrategia(request);

        log.info("Usando estrategia '{}' para generar artículo", estrategia.getNombre());

        long startTime = System.currentTimeMillis();
        ArticuloGeneradoIA resultado = estrategia.generar(request);
        long tiempoMs = System.currentTimeMillis() - startTime;

        log.info("Artículo generado con estrategia '{}' en {}ms",
                estrategia.getNombre(), tiempoMs);

        return resultado;
    }

    /**
     * Selecciona la estrategia apropiada para la solicitud.
     * 
     * @param request Solicitud de generación
     * @return Estrategia que puede procesar la solicitud
     * @throws OperacionInvalidaException si ninguna estrategia soporta la solicitud
     */
    public GeneracionArticuloStrategy seleccionarEstrategia(GeneracionArticuloRequest request) {
        return estrategias.stream()
                .filter(s -> s.soporta(request))
                .findFirst()
                .orElseThrow(() -> new OperacionInvalidaException(
                        "No hay estrategia de generación disponible para el tipo de solicitud: " +
                                request.getTipoFuente()));
    }

    /**
     * Obtiene una estrategia por su nombre.
     * 
     * @param nombre Nombre de la estrategia
     * @return Estrategia correspondiente
     * @throws OperacionInvalidaException si no existe la estrategia
     */
    public GeneracionArticuloStrategy obtenerEstrategia(String nombre) {
        GeneracionArticuloStrategy estrategia = estrategiasPorNombre.get(nombre);
        if (estrategia == null) {
            throw new OperacionInvalidaException(
                    "Estrategia no encontrada: " + nombre +
                            ". Disponibles: " + String.join(", ", estrategiasPorNombre.keySet()));
        }
        return estrategia;
    }

    /**
     * Verifica si hay una estrategia disponible para la solicitud.
     * 
     * @param request Solicitud de generación
     * @return true si hay una estrategia disponible
     */
    public boolean hayEstrategiaDisponible(GeneracionArticuloRequest request) {
        return estrategias.stream().anyMatch(s -> s.soporta(request));
    }

    /**
     * Obtiene la lista de todas las estrategias disponibles.
     * 
     * @return Lista de estrategias
     */
    public List<GeneracionArticuloStrategy> obtenerEstrategiasDisponibles() {
        return List.copyOf(estrategias);
    }

    /**
     * Obtiene información resumida de las estrategias disponibles.
     * 
     * @return Mapa con nombre -> descripción de cada estrategia
     */
    public Map<String, String> obtenerInfoEstrategias() {
        return estrategias.stream()
                .collect(Collectors.toMap(
                        GeneracionArticuloStrategy::getNombre,
                        GeneracionArticuloStrategy::getDescripcion));
    }
}
