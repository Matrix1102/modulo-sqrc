package com.sqrc.module.backendsqrc.plantillaRespuesta.Strategy;

public interface GeneradorDocumentoStrategy {

    byte[] generarArchivo(String contenidoHtml);
}
