package com.sqrc.module.backendsqrc.ticket.exception;

/**
 * Excepción lanzada cuando no se encuentra una documentación.
 * 
 * Patrón: Custom Exception
 */
public class DocumentacionNotFoundException extends RuntimeException {

    private final Integer documentacionId;

    public DocumentacionNotFoundException(Integer documentacionId) {
        super("Documentación no encontrada con ID: " + documentacionId);
        this.documentacionId = documentacionId;
    }

    public DocumentacionNotFoundException(String message) {
        super(message);
        this.documentacionId = null;
    }

    public Integer getDocumentacionId() {
        return documentacionId;
    }
}
