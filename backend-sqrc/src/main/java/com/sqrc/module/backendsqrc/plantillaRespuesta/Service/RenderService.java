package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;


import freemarker.template.Template;
import org.springframework.stereotype.Service;
import freemarker.template.Configuration;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Map;

@Service
public class RenderService {

    private final Configuration freeMarkerConfig;

    public RenderService(Configuration freeMarkerConfig) {
        this.freeMarkerConfig = freeMarkerConfig;
    }

    public String renderizar(String contenidoPlantilla, Map<String, Object> variables) {
        try {
            // 1. Creamos un "Template" al vuelo usando el String que viene de la BD
            // El primer parámetro es un nombre interno (usamos "plantilla_db" o lo que quieras)
            Template t = new Template("plantilla_db", new StringReader(contenidoPlantilla), freeMarkerConfig);

            // 2. Procesamos (Mezclamos el HTML con el Map de variables)
            //se crea un espacio en memoria para guardar el html procesado
            StringWriter out = new StringWriter();
            //se reemplazan las varaibles en la plantilla
            t.process(variables, out);

            // 3. Devolvemos el HTML final ya con los nombres reales
            return out.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la plantilla con FreeMarker", e);
        }
    }
}
