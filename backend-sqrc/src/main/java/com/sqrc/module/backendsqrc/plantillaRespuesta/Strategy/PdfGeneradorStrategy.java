package com.sqrc.module.backendsqrc.plantillaRespuesta.Strategy;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
@Service
@Component("pdfStrategy")
public class PdfGeneradorStrategy implements GeneradorDocumentoStrategy{

    //Recibe un String con HTML y devuelve el archivo PDF crudo (bytes).
    @Override
    public byte[] generarArchivo(String htmlContenido) {

        //ByteArrayOutputStream es como un "archivo en memoria RAM".
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {

            //objeto que genera secuencia de bytes que representan un pdf
            PdfRendererBuilder builder = new PdfRendererBuilder();

            //configuramos el contenido HTML
            //el segundo parámetro (baseUri) es null porque no estamos cargando imagenes desde disco
            builder.withHtmlContent(htmlContenido, null);

            //le decimos que el resultado lo guarde en el stream os
            builder.toStream(os);

            //genera el pdf
            builder.run();

            //devolvemos el resultado como un array de bytes
            return os.toByteArray();

        } catch (Exception e) {
            // Si el HTML está mal formado, fallará aquí.
            throw new RuntimeException("Error al generar el PDF: " + e.getMessage(), e);
        }
    }
}
