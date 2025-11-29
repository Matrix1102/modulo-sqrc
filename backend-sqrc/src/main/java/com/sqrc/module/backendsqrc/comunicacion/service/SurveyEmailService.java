package com.sqrc.module.backendsqrc.comunicacion.service;

import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PlantillaService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.PdfService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.RenderService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.EmailService;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SurveyEmailService {

    private static final Logger log = LoggerFactory.getLogger(SurveyEmailService.class);

    private final PlantillaService plantillaService;
    private final RenderService renderService;
    private final PdfService pdfService;
    private final EmailService emailService;

    /**
     * Send a survey email using the given plantilla id.
     * This method renders the plantilla with provided variables and sends the HTML.
     * If attachPdf is true, a PDF is generated from the HTML and attached.
     *
     * @param plantillaId id of the plantilla to use
     * @param destinatario recipient email
     * @param variables variables map for rendering the plantilla
     * @param attachPdf whether to attach a generated PDF
     * @param asunto optional subject; if null, plantilla subject or a default will be used
     */
    public void enviarEncuestaPorPlantilla(Long plantillaId, String destinatario, Map<String, Object> variables, boolean attachPdf, String asunto) {
        try {
            Plantilla plantilla = plantillaService.obtenerPorId(plantillaId);
            if (plantilla == null) {
                throw new IllegalArgumentException("Plantilla no encontrada: " + plantillaId);
            }

            String html = renderService.renderizar(plantilla.getHtmlModel(), variables == null ? Map.of() : variables);

            String subject = asunto != null && !asunto.isBlank() ? asunto : (plantilla.getTituloVisible() != null ? plantilla.getTituloVisible() : "Encuesta SQRC");

            if (attachPdf) {
                byte[] pdf = pdfService.generarPdfDesdeHtml(html);
                String filename = "Encuesta_" + (plantillaId != null ? plantillaId : "pdf") + ".pdf";
                emailService.enviarCorreoConAdjunto(destinatario, subject, html, pdf, filename);
                log.info("Correo con encuesta enviado a {} (plantilla={}, adjunto=true)", destinatario, plantillaId);
            } else {
                emailService.enviarCorreoHtmlAsync(destinatario, subject, html);
                log.info("Correo con encuesta enviado a {} (plantilla={}, adjunto=false)", destinatario, plantillaId);
            }

        } catch (Exception ex) {
            log.error("Error enviando encuesta por plantilla {} a {}: {}", plantillaId, destinatario, ex.getMessage(), ex);
            throw new RuntimeException("Error enviando encuesta: " + ex.getMessage(), ex);
        }
    }

}
