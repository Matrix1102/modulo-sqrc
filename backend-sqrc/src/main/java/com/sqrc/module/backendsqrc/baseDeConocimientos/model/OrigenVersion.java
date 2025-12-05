package com.sqrc.module.backendsqrc.baseDeConocimientos.model;

/**
 * Indica el origen de una versión de artículo.
 */
public enum OrigenVersion {
    MANUAL, // Creado manualmente por un supervisor
    DERIVADO_DE_DOCUMENTACION, // Generado a partir de la documentación de un ticket
    DOCUMENTO_SUBIDO, // Generado a partir de un documento subido (PDF, Word, etc.)
    TEMA_LIBRE // Generado a partir de un tema libre especificado
}
