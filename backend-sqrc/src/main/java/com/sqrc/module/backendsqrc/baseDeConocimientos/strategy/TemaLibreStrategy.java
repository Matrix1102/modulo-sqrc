package com.sqrc.module.backendsqrc.baseDeConocimientos.strategy;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.GeneracionArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Strategy para generar artículos desde un tema libre especificado por el
 * usuario.
 * 
 * Esta estrategia permite al usuario solicitar la generación de un artículo
 * sobre un tema específico sin necesidad de documentación previa.
 * Útil para crear contenido de ejemplo o artículos sobre temas generales.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TemaLibreStrategy implements GeneracionArticuloStrategy {

    private final GeminiService geminiService;

    @Override
    public ArticuloGeneradoIA generar(GeneracionArticuloRequest request) {
        log.info("Generando artículo desde tema libre: {}", request.getTema());

        return geminiService.generarArticuloDeEjemplo(
                request.getTema(),
                request.getEtiquetaSugerida(),
                request.getTipoCasoSugerido());
    }

    @Override
    public boolean soporta(GeneracionArticuloRequest request) {
        return request.esDesdeTemaLibre();
    }

    @Override
    public String getNombre() {
        return "TEMA_LIBRE";
    }

    @Override
    public String getDescripcion() {
        return "Genera artículos desde un tema libre especificado por el usuario";
    }
}
