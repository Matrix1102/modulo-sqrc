package com.sqrc.module.backendsqrc.baseDeConocimientos.strategy;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.GeneracionArticuloRequest;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.OperacionInvalidaException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.stream.Collectors;

/**
 * Strategy para generar artículos desde documentos subidos (PDF, Word, TXT).
 * 
 * Esta estrategia extrae el texto de documentos subidos por el usuario
 * y lo envía a Gemini para generar un artículo estructurado.
 * 
 * Formatos soportados:
 * - PDF (.pdf)
 * - Word (.doc, .docx)
 * - Texto plano (.txt)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentoUploadStrategy implements GeneracionArticuloStrategy {

    private final GeminiService geminiService;

    // Tamaño máximo de texto a procesar (para evitar tokens excesivos)
    private static final int MAX_CARACTERES = 50000;

    @Override
    public ArticuloGeneradoIA generar(GeneracionArticuloRequest request) {
        log.info("Generando artículo desde documento: {}", request.getNombreDocumento());

        String contenido = request.getContenidoDocumento();

        // Si el contenido no está extraído aún, extraerlo del archivo
        if (contenido == null || contenido.isBlank()) {
            if (request.getDocumento() == null) {
                throw new OperacionInvalidaException("No se proporcionó documento para procesar");
            }
            contenido = extraerTextoDeDocumento(request.getDocumento());
        }

        // Truncar si es muy largo
        if (contenido.length() > MAX_CARACTERES) {
            log.warn("Documento muy largo ({} caracteres), truncando a {}", 
                    contenido.length(), MAX_CARACTERES);
            contenido = contenido.substring(0, MAX_CARACTERES) + 
                    "\n\n[... Contenido truncado por longitud ...]";
        }

        // Llamar a Gemini para generar el artículo desde el contenido del documento
        return geminiService.generarArticuloDesdeDocumento(
                contenido,
                request.getNombreDocumento());
    }

    @Override
    public boolean soporta(GeneracionArticuloRequest request) {
        return request.esDesdeDocumentoUpload();
    }

    @Override
    public String getNombre() {
        return "DOCUMENTO_UPLOAD";
    }

    @Override
    public String getDescripcion() {
        return "Genera artículos desde documentos subidos (PDF, Word, TXT)";
    }

    /**
     * Extrae el texto de un documento subido según su tipo.
     * 
     * @param archivo Archivo subido
     * @return Texto extraído del documento
     */
    public String extraerTextoDeDocumento(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new OperacionInvalidaException("El archivo está vacío o es nulo");
        }

        String nombreArchivo = archivo.getOriginalFilename();
        String tipoMime = archivo.getContentType();

        log.info("Extrayendo texto de: {} ({})", nombreArchivo, tipoMime);

        try {
            // Detectar tipo por extensión o MIME type
            if (esPDF(nombreArchivo, tipoMime)) {
                return extraerTextoPDF(archivo.getInputStream());
            } else if (esDocx(nombreArchivo, tipoMime)) {
                return extraerTextoDocx(archivo.getInputStream());
            } else if (esDoc(nombreArchivo, tipoMime)) {
                return extraerTextoDoc(archivo.getInputStream());
            } else if (esTxt(nombreArchivo, tipoMime)) {
                return new String(archivo.getBytes());
            } else {
                throw new OperacionInvalidaException(
                        "Formato de archivo no soportado: " + tipoMime + 
                        ". Use PDF, Word (.doc/.docx) o TXT.");
            }
        } catch (IOException e) {
            log.error("Error al leer el archivo: {}", e.getMessage(), e);
            throw new OperacionInvalidaException("Error al procesar el archivo: " + e.getMessage());
        }
    }

    /**
     * Extrae texto de un archivo PDF usando Apache PDFBox.
     */
    private String extraerTextoPDF(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String texto = stripper.getText(document);
            log.info("Texto extraído de PDF: {} caracteres, {} páginas", 
                    texto.length(), document.getNumberOfPages());
            return texto;
        }
    }

    /**
     * Extrae texto de un archivo Word moderno (.docx) usando Apache POI.
     */
    private String extraerTextoDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            String texto = document.getParagraphs().stream()
                    .map(XWPFParagraph::getText)
                    .collect(Collectors.joining("\n"));
            log.info("Texto extraído de DOCX: {} caracteres", texto.length());
            return texto;
        }
    }

    /**
     * Extrae texto de un archivo Word antiguo (.doc) usando Apache POI.
     */
    private String extraerTextoDoc(InputStream inputStream) throws IOException {
        try (HWPFDocument document = new HWPFDocument(inputStream);
             WordExtractor extractor = new WordExtractor(document)) {
            String texto = extractor.getText();
            log.info("Texto extraído de DOC: {} caracteres", texto.length());
            return texto;
        }
    }

    // ========== Métodos de detección de tipo ==========

    private boolean esPDF(String nombre, String mime) {
        return (nombre != null && nombre.toLowerCase().endsWith(".pdf")) ||
               "application/pdf".equals(mime);
    }

    private boolean esDocx(String nombre, String mime) {
        return (nombre != null && nombre.toLowerCase().endsWith(".docx")) ||
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(mime);
    }

    private boolean esDoc(String nombre, String mime) {
        return (nombre != null && nombre.toLowerCase().endsWith(".doc")) ||
               "application/msword".equals(mime);
    }

    private boolean esTxt(String nombre, String mime) {
        return (nombre != null && nombre.toLowerCase().endsWith(".txt")) ||
               (mime != null && mime.startsWith("text/"));
    }
}
