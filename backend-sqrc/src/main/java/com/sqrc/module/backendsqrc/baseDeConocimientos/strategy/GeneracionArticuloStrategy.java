package com.sqrc.module.backendsqrc.baseDeConocimientos.strategy;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.GeneracionArticuloRequest;

/**
 * Interface Strategy para la generación de artículos con IA.
 * 
 * Patrón Strategy: Define una familia de algoritmos de generación,
 * encapsula cada uno, y los hace intercambiables.
 * 
 * Cada implementación representa una fuente diferente de datos:
 * - Documentación de tickets
 * - Documentos subidos (PDF, Word, etc.)
 * - Tema libre / Ejemplo
 */
public interface GeneracionArticuloStrategy {

    /**
     * Genera el contenido del artículo usando la fuente específica.
     * 
     * @param request Datos de la solicitud de generación
     * @return Artículo generado con contenido estructurado
     */
    ArticuloGeneradoIA generar(GeneracionArticuloRequest request);

    /**
     * Valida si la estrategia puede procesar la solicitud.
     * 
     * @param request Datos de la solicitud
     * @return true si la estrategia puede procesar esta solicitud
     */
    boolean soporta(GeneracionArticuloRequest request);

    /**
     * Obtiene el nombre identificador de la estrategia.
     * 
     * @return Nombre de la estrategia (ej: "DOCUMENTACION", "DOCUMENTO_UPLOAD")
     */
    String getNombre();

    /**
     * Obtiene una descripción de la estrategia.
     * 
     * @return Descripción legible para logs y mensajes
     */
    String getDescripcion();
}
