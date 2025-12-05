package com.sqrc.module.backendsqrc.baseDeConocimientos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ContextoDocumentacionDTO;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Servicio para comunicación con la API de Google Gemini.
 * Utiliza el SDK oficial google-genai con el modelo Gemini 2.5 Flash.
 */
@Service
@Slf4j
public class GeminiService {

    private final ObjectMapper objectMapper;
    private Client geminiClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String model;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("TU_API_KEY_AQUI")) {
            this.geminiClient = Client.builder().apiKey(apiKey).build();
            log.info("✅ Gemini Client inicializado con modelo: {}", model);
        } else {
            log.warn("⚠️ Gemini API Key no configurada correctamente");
        }
    }

    /**
     * Genera un artículo de conocimiento a partir del contexto de documentación.
     * 
     * @param contexto              Información de la documentación, ticket y asignación
     * @param instruccionesAdicionales Instrucciones extra del usuario (opcional)
     * @return ArticuloGeneradoIA con el contenido generado
     */
    public ArticuloGeneradoIA generarArticuloDesdeContexto(ContextoDocumentacionDTO contexto, 
                                                           String instruccionesAdicionales) {
        log.info("Generando artículo con Gemini para documentación ID: {}", contexto.getIdDocumentacion());

        String prompt = construirPrompt(contexto, instruccionesAdicionales);
        
        try {
            String respuestaGemini = llamarGeminiAPI(prompt);
            return parsearRespuestaGemini(respuestaGemini);
        } catch (Exception e) {
            log.error("Error al generar artículo con Gemini: {}", e.getMessage(), e);
            throw new RuntimeException("Error al comunicarse con Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Construye el prompt para Gemini con el contexto de la documentación.
     */
    private String construirPrompt(ContextoDocumentacionDTO contexto, String instruccionesAdicionales) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Genera un artículo de base de conocimiento para CRM de telecomunicaciones.\n\n");
        prompt.append("TICKET: ").append(contexto.getAsuntoTicket()).append("\n");
        prompt.append("PROBLEMA: ").append(contexto.getProblema()).append("\n");
        prompt.append("SOLUCIÓN: ").append(contexto.getSolucion()).append("\n");
        prompt.append("TIPO: ").append(contexto.getTipoTicket()).append("\n");
        
        if (instruccionesAdicionales != null && !instruccionesAdicionales.isBlank()) {
            prompt.append("EXTRA: ").append(instruccionesAdicionales).append("\n");
        }
        
        prompt.append("""
            
            Responde SOLO con JSON válido:
            {"titulo":"max 100 chars","resumen":"2 oraciones","contenido":"HTML con pasos","etiqueta":"TROUBLESHOOTING","tipoCaso":"CONSULTA","visibilidad":"AGENTE","tags":"5 tags con comas","confianza":0.85}
            
            CONTENIDO debe ser HTML con esta estructura:
            <h2>📋 Problema</h2><p>...</p>
            <h2>🔍 Causa</h2><p>...</p>
            <h2>✅ Pasos para Solucionar</h2>
            <ol><li><strong>Paso 1:</strong> ...</li><li><strong>Paso 2:</strong> ...</li><li><strong>Paso 3:</strong> ...</li><li><strong>Paso 4:</strong> ...</li></ol>
            <h2>⚠️ Notas</h2><ul><li>...</li></ul>
            
            etiqueta: GUIAS|FAQS|CASOS|TROUBLESHOOTING|INSTRUCTIVOS
            tipoCaso: SOLICITUD|QUEJA|RECLAMO|CONSULTA|TODOS
            """);
        
        return prompt.toString();
    }

    /**
     * Llama a la API de Gemini usando el SDK oficial y retorna la respuesta como texto.
     */
    private String llamarGeminiAPI(String prompt) {
        if (geminiClient == null) {
            throw new RuntimeException("Gemini Client no está inicializado. Verifica la API Key.");
        }

        log.debug("Llamando a Gemini API con modelo: {}", model);

        // Configuración para respuesta JSON
        GenerateContentConfig config = GenerateContentConfig.builder()
            .temperature(0.4f)
            .topK(20f)
            .topP(0.8f)
            .maxOutputTokens(2048)
            .responseMimeType("application/json")
            .build();

        // Llamar a la API usando el SDK
        GenerateContentResponse response = geminiClient.models.generateContent(
            model,
            prompt,
            config
        );

        String textoRespuesta = response.text();
        log.debug("Respuesta de Gemini recibida: {} caracteres", 
            textoRespuesta != null ? textoRespuesta.length() : 0);
        
        return textoRespuesta;
    }

    /**
     * Parsea la respuesta JSON de Gemini y extrae el artículo generado.
     */
    /**
     * Parsea la respuesta JSON de Gemini y extrae el artículo generado.
     * Con el SDK, response.text() ya retorna directamente el contenido.
     */
    private ArticuloGeneradoIA parsearRespuestaGemini(String textoGenerado) {
        try {
            // Limpiar el texto si viene con marcadores de código
            textoGenerado = limpiarJsonResponse(textoGenerado);
            
            // Parsear el JSON del artículo
            JsonNode articuloJson = objectMapper.readTree(textoGenerado);
            
            return ArticuloGeneradoIA.builder()
                .titulo(articuloJson.path("titulo").asText("Sin título"))
                .resumen(articuloJson.path("resumen").asText(""))
                .contenido(articuloJson.path("contenido").asText(""))
                .etiqueta(parseEtiqueta(articuloJson.path("etiqueta").asText("TROUBLESHOOTING")))
                .tipoCaso(parseTipoCaso(articuloJson.path("tipoCaso").asText("TODOS")))
                .visibilidad(parseVisibilidad(articuloJson.path("visibilidad").asText("AGENTE")))
                .tags(articuloJson.path("tags").asText(""))
                .notaCambio(articuloJson.path("notaCambio").asText("Generado automáticamente con IA"))
                .confianza(articuloJson.path("confianza").asDouble(0.8))
                .sugerencias(parseSugerencias(articuloJson.path("sugerencias")))
                .build();
                
        } catch (Exception e) {
            log.error("Error parseando respuesta de Gemini: {}", e.getMessage());
            throw new RuntimeException("Error al procesar respuesta de Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Limpia la respuesta JSON de posibles marcadores de código.
     */
    private String limpiarJsonResponse(String texto) {
        if (texto == null) return "{}";
        
        texto = texto.trim();
        
        // Remover marcadores de código markdown
        if (texto.startsWith("```json")) {
            texto = texto.substring(7);
        } else if (texto.startsWith("```")) {
            texto = texto.substring(3);
        }
        
        if (texto.endsWith("```")) {
            texto = texto.substring(0, texto.length() - 3);
        }
        
        return texto.trim();
    }

    private Etiqueta parseEtiqueta(String valor) {
        try {
            return Etiqueta.valueOf(valor.toUpperCase());
        } catch (Exception e) {
            return Etiqueta.TROUBLESHOOTING;
        }
    }

    private TipoCaso parseTipoCaso(String valor) {
        try {
            return TipoCaso.valueOf(valor.toUpperCase());
        } catch (Exception e) {
            return TipoCaso.TODOS;
        }
    }

    private Visibilidad parseVisibilidad(String valor) {
        try {
            return Visibilidad.valueOf(valor.toUpperCase());
        } catch (Exception e) {
            return Visibilidad.AGENTE;
        }
    }

    private List<String> parseSugerencias(JsonNode node) {
        List<String> sugerencias = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(n -> sugerencias.add(n.asText()));
        }
        return sugerencias;
    }

    /**
     * Verifica si el servicio de Gemini está configurado correctamente.
     */
    public boolean estaConfigurado() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("TU_API_KEY_AQUI");
    }

    /**
     * Genera un artículo de conocimiento sin documentación previa.
     * Útil para crear artículos de ejemplo o desde un tema específico.
     * 
     * @param tema                  Tema opcional para el artículo
     * @param etiquetaSugerida      Etiqueta sugerida (opcional)
     * @param tipoCasoSugerido      Tipo de caso sugerido (opcional)
     * @return ArticuloGeneradoIA con el contenido generado
     */
    public ArticuloGeneradoIA generarArticuloDeEjemplo(String tema, String etiquetaSugerida, String tipoCasoSugerido) {
        log.info("Generando artículo de ejemplo con Gemini. Tema: {}", tema);

        String prompt = construirPromptEjemplo(tema, etiquetaSugerida, tipoCasoSugerido);
        
        try {
            String respuestaGemini = llamarGeminiAPI(prompt);
            return parsearRespuestaGemini(respuestaGemini);
        } catch (Exception e) {
            log.error("Error al generar artículo de ejemplo con Gemini: {}", e.getMessage(), e);
            throw new RuntimeException("Error al comunicarse con Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Construye el prompt para generar un artículo de ejemplo.
     */
    private String construirPromptEjemplo(String tema, String etiquetaSugerida, String tipoCasoSugerido) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("""
            Eres un experto en documentación técnica para empresas de telecomunicaciones.
            Tu tarea es crear un artículo profesional para la Base de Conocimiento de un sistema CRM.
            Este artículo será usado por agentes de atención al cliente para resolver casos similares.
            
            """);
        
        if (tema != null && !tema.isBlank()) {
            prompt.append("TEMA DEL ARTÍCULO: ").append(tema).append("\n\n");
        } else {
            prompt.append("""
                TEMA: Genera un artículo útil sobre un problema común en telecomunicaciones.
                Ejemplos: configuración de router, problemas de conexión, cambio de plan, 
                activación de servicios, facturación, etc.
                
                """);
        }
        
        if (etiquetaSugerida != null && !etiquetaSugerida.isBlank()) {
            prompt.append("ETIQUETA SUGERIDA: ").append(etiquetaSugerida).append("\n");
        }
        
        if (tipoCasoSugerido != null && !tipoCasoSugerido.isBlank()) {
            prompt.append("TIPO DE CASO SUGERIDO: ").append(tipoCasoSugerido).append("\n");
        }
        
        prompt.append("""
            
            INSTRUCCIONES DE GENERACIÓN:
            ============================
            Genera un artículo de conocimiento estructurado y profesional.
            Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
            
            {
                "titulo": "Título claro y descriptivo (máximo 100 caracteres)",
                "resumen": "Resumen de 2-3 oraciones que describa el problema y la solución",
                "contenido": "Contenido HTML estructurado como guía paso a paso (ver formato abajo)",
                "etiqueta": "Una de: GUIAS, POLITICAS, FAQS, CASOS, TROUBLESHOOTING, DESCRIPCIONES, INSTRUCTIVOS",
                "tipoCaso": "Una de: SOLICITUD, QUEJA, RECLAMO, CONSULTA, TODOS",
                "visibilidad": "AGENTE",
                "tags": "palabras clave separadas por comas (mínimo 5 tags)",
                "notaCambio": "Artículo generado automáticamente con IA",
                "confianza": 0.9,
                "sugerencias": ["Revisar pasos técnicos", "Agregar capturas de pantalla si es necesario"]
            }
            
            FORMATO DEL CONTENIDO (estructura obligatoria):
            ===============================================
            El contenido DEBE seguir esta estructura HTML con pasos enumerados:
            
            <h2>📋 Descripción del Problema</h2>
            <p>Descripción clara y concisa del problema.</p>
            
            <h2>🔍 Diagnóstico / Causa</h2>
            <p>Explicación de la causa raíz identificada.</p>
            
            <h2>✅ Pasos para la Solución</h2>
            <ol>
                <li><strong>Paso 1:</strong> Descripción detallada del primer paso.</li>
                <li><strong>Paso 2:</strong> Descripción del segundo paso.</li>
                <li><strong>Paso 3:</strong> Descripción del tercer paso.</li>
            </ol>
            
            <h2>⚠️ Notas Importantes</h2>
            <ul>
                <li>Nota relevante 1</li>
                <li>Nota relevante 2</li>
            </ul>
            
            IMPORTANTE:
            - El contenido DEBE estar en HTML con pasos enumerados usando <ol><li>
            - Cada paso debe ser específico y accionable
            - Incluye entre 4 y 8 pasos según la complejidad
            - Usa un tono profesional y claro
            - Responde SOLO con el JSON, sin texto adicional ni explicaciones
            """);
        
        return prompt.toString();
    }
}
