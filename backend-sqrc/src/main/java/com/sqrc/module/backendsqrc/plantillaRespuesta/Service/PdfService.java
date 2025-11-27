package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;


import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
@Service
public class PdfService {

    public byte[] generarPdfDesdeHtml(String contenidoHtml) {

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {

            PdfRendererBuilder builder = new PdfRendererBuilder();

            builder.withHtmlContent(contenidoHtml, null);

            builder.toStream(os);

            builder.run();

            return os.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF: " + e.getMessage(), e);
        }
    }
}
