package com.sqrc.module.backendsqrc.baseDeConocimientos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando no se encuentra una versión de artículo.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class VersionNotFoundException extends RuntimeException {

    public VersionNotFoundException(String mensaje) {
        super(mensaje);
    }

    public VersionNotFoundException(Integer id) {
        super("Versión de artículo no encontrada con ID: " + id);
    }

    public VersionNotFoundException(Integer idArticulo, Integer numeroVersion) {
        super("Versión " + numeroVersion + " no encontrada para el artículo ID: " + idArticulo);
    }
}
