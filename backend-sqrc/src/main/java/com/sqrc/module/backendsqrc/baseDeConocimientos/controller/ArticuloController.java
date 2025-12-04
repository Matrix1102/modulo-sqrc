package com.sqrc.module.backendsqrc.baseDeConocimientos.controller;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Etiqueta;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.TipoCaso;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Visibilidad;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.ArticuloIAService;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.ArticuloService;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.ArticuloVersionService;
import com.sqrc.module.backendsqrc.baseDeConocimientos.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de artículos de la base de conocimiento.
 */
@RestController
@RequestMapping("/api/articulos")
@RequiredArgsConstructor
@Slf4j
public class ArticuloController {

    private final ArticuloService articuloService;
    private final ArticuloVersionService versionService;
    private final FeedbackService feedbackService;
    private final ArticuloIAService articuloIAService;

    // ===================== ENDPOINTS DE ARTÍCULOS =====================

    /**
     * Crea un nuevo artículo con su versión inicial.
     * POST /api/articulos
     */
    @PostMapping
    public ResponseEntity<ArticuloResponse> crearArticulo(@Valid @RequestBody CrearArticuloRequest request) {
        log.info("POST /api/articulos - Creando nuevo artículo");
        ArticuloResponse response = articuloService.crearArticulo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene un artículo por su ID.
     * GET /api/articulos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticuloResponse> obtenerArticulo(@PathVariable Integer id) {
        log.info("GET /api/articulos/{}", id);
        ArticuloResponse response = articuloService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene un artículo por su código.
     * GET /api/articulos/codigo/{codigo}
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ArticuloResponse> obtenerPorCodigo(@PathVariable String codigo) {
        log.info("GET /api/articulos/codigo/{}", codigo);
        ArticuloResponse response = articuloService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }

    /**
     * Actualiza un artículo existente.
     * PUT /api/articulos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ArticuloResponse> actualizarArticulo(
            @PathVariable Integer id,
            @Valid @RequestBody ActualizarArticuloRequest request) {
        log.info("PUT /api/articulos/{}", id);
        ArticuloResponse response = articuloService.actualizarArticulo(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un artículo (solo si está en borrador).
     * DELETE /api/articulos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarArticulo(@PathVariable Integer id) {
        log.info("DELETE /api/articulos/{}", id);
        articuloService.eliminarArticulo(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca artículos con filtros.
     * POST /api/articulos/buscar
     */
    @PostMapping("/buscar")
    public ResponseEntity<PaginaResponse<ArticuloResumenResponse>> buscarArticulos(
            @RequestBody BusquedaArticuloRequest request) {
        log.info("POST /api/articulos/buscar");
        PaginaResponse<ArticuloResumenResponse> response = articuloService.buscarArticulos(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Búsqueda rápida de artículos por texto.
     * GET /api/articulos/buscar?texto=...&etiqueta=...&visibilidad=...
     */
    @GetMapping("/buscar")
    public ResponseEntity<PaginaResponse<ArticuloResumenResponse>> buscarArticulosGet(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) Etiqueta etiqueta,
            @RequestParam(required = false) Visibilidad visibilidad,
            @RequestParam(required = false) TipoCaso tipoCaso,
            @RequestParam(defaultValue = "0") Integer pagina,
            @RequestParam(defaultValue = "10") Integer tamanio) {
        log.info("GET /api/articulos/buscar?texto={}", texto);

        BusquedaArticuloRequest request = BusquedaArticuloRequest.builder()
                .texto(texto)
                .etiqueta(etiqueta)
                .visibilidad(visibilidad)
                .tipoCaso(tipoCaso)
                .pagina(pagina)
                .tamanoPagina(tamanio)
                .build();

        PaginaResponse<ArticuloResumenResponse> response = articuloService.buscarArticulos(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene artículos publicados (para agentes).
     * GET /api/articulos/publicados
     */
    @GetMapping("/publicados")
    public ResponseEntity<List<ArticuloResumenResponse>> obtenerPublicados(
            @RequestParam(required = false) Visibilidad visibilidad) {
        log.info("GET /api/articulos/publicados");
        List<ArticuloResumenResponse> response = articuloService.obtenerArticulosPublicados(visibilidad);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene mis artículos (del propietario).
     * GET /api/articulos/mis-articulos/{idEmpleado}
     */
    @GetMapping("/mis-articulos/{idEmpleado}")
    public ResponseEntity<List<ArticuloResumenResponse>> obtenerMisArticulos(@PathVariable Long idEmpleado) {
        log.info("GET /api/articulos/mis-articulos/{}", idEmpleado);
        List<ArticuloResumenResponse> response = articuloService.obtenerMisArticulos(idEmpleado);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene mis borradores.
     * GET /api/articulos/mis-borradores/{idEmpleado}
     */
    @GetMapping("/mis-borradores/{idEmpleado}")
    public ResponseEntity<List<ArticuloResumenResponse>> obtenerMisBorradores(@PathVariable Long idEmpleado) {
        log.info("GET /api/articulos/mis-borradores/{}", idEmpleado);
        List<ArticuloResumenResponse> response = articuloService.obtenerMisBorradores(idEmpleado);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene artículos deprecados (vencidos).
     * GET /api/articulos/deprecados
     */
    @GetMapping("/deprecados")
    public ResponseEntity<List<ArticuloResumenResponse>> obtenerDeprecados() {
        log.info("GET /api/articulos/deprecados");
        List<ArticuloResumenResponse> response = articuloService.obtenerArticulosDeprecados();
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene artículos más populares.
     * GET /api/articulos/populares?limite=10
     */
    @GetMapping("/populares")
    public ResponseEntity<List<ArticuloResumenResponse>> obtenerPopulares(
            @RequestParam(defaultValue = "10") int limite) {
        log.info("GET /api/articulos/populares?limite={}", limite);
        List<ArticuloResumenResponse> response = articuloService.obtenerMasPopulares(limite);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca sugerencias de artículos activos por palabras clave.
     * Retorna artículos ordenados por relevancia (coincidencia en título > resumen
     * > tags)
     * y cantidad de feedbacks positivos.
     * GET /api/articulos/sugerencias?q=roaming&limite=4&visibilidad=AGENTE
     */
    @GetMapping("/sugerencias")
    public ResponseEntity<List<ArticuloResumenResponse>> buscarSugerencias(
            @RequestParam("q") String palabrasClave,
            @RequestParam(defaultValue = "4") int limite,
            @RequestParam(required = false) Visibilidad visibilidad) {
        log.info("GET /api/articulos/sugerencias?q={}&limite={}&visibilidad={}", palabrasClave, limite, visibilidad);
        List<ArticuloResumenResponse> response = articuloService.buscarSugerencias(palabrasClave, visibilidad, limite);
        return ResponseEntity.ok(response);
    }

    /**
     * Genera un código único para un nuevo artículo.
     * GET /api/articulos/generar-codigo
     */
    @GetMapping("/generar-codigo")
    public ResponseEntity<String> generarCodigo() {
        log.info("GET /api/articulos/generar-codigo");
        String codigo = articuloService.generarCodigoUnico();
        return ResponseEntity.ok(codigo);
    }

    // ===================== ENDPOINTS DE VERSIONES =====================

    /**
     * Crea una nueva versión de un artículo.
     * POST /api/articulos/{idArticulo}/versiones
     */
    @PostMapping("/{idArticulo}/versiones")
    public ResponseEntity<ArticuloVersionResponse> crearVersion(
            @PathVariable Integer idArticulo,
            @Valid @RequestBody CrearVersionRequest request) {
        log.info("POST /api/articulos/{}/versiones", idArticulo);
        ArticuloVersionResponse response = versionService.crearVersion(idArticulo, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene todas las versiones de un artículo.
     * GET /api/articulos/{idArticulo}/versiones
     */
    @GetMapping("/{idArticulo}/versiones")
    public ResponseEntity<List<ArticuloVersionResponse>> obtenerVersiones(@PathVariable Integer idArticulo) {
        log.info("GET /api/articulos/{}/versiones", idArticulo);
        List<ArticuloVersionResponse> response = versionService.obtenerVersionesDeArticulo(idArticulo);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene la versión vigente de un artículo.
     * GET /api/articulos/{idArticulo}/version-vigente
     */
    @GetMapping("/{idArticulo}/version-vigente")
    public ResponseEntity<ArticuloVersionResponse> obtenerVersionVigente(@PathVariable Integer idArticulo) {
        log.info("GET /api/articulos/{}/version-vigente", idArticulo);
        ArticuloVersionResponse response = versionService.obtenerVersionVigente(idArticulo);
        return ResponseEntity.ok(response);
    }

    /**
     * Marca una versión como vigente.
     * PUT /api/articulos/{idArticulo}/versiones/{idVersion}/vigente
     */
    @PutMapping("/{idArticulo}/versiones/{idVersion}/vigente")
    public ResponseEntity<ArticuloVersionResponse> marcarComoVigente(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion) {
        log.info("PUT /api/articulos/{}/versiones/{}/vigente", idArticulo, idVersion);
        ArticuloVersionResponse response = versionService.marcarComoVigente(idVersion);
        return ResponseEntity.ok(response);
    }

    /**
     * Propone una versión para revisión del supervisor.
     * PUT /api/articulos/{idArticulo}/versiones/{idVersion}/proponer
     */
    @PutMapping("/{idArticulo}/versiones/{idVersion}/proponer")
    public ResponseEntity<ArticuloVersionResponse> proponerVersion(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion) {
        log.info("PUT /api/articulos/{}/versiones/{}/proponer", idArticulo, idVersion);
        ArticuloVersionResponse response = versionService.proponerVersion(idVersion);
        return ResponseEntity.ok(response);
    }

    /**
     * Publica un artículo con una versión específica.
     * POST /api/articulos/{idArticulo}/publicacion
     */
    @PostMapping("/{idArticulo}/publicacion")
    public ResponseEntity<ArticuloVersionResponse> publicarArticulo(
            @PathVariable Integer idArticulo,
            @RequestParam Integer idVersion,
            @Valid @RequestBody PublicarArticuloRequest request) {
        log.info("POST /api/articulos/{}/publicacion?idVersion={}", idArticulo, idVersion);
        ArticuloVersionResponse response = versionService.publicarArticulo(idArticulo, idVersion, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Archiva una versión.
     * PUT /api/articulos/{idArticulo}/versiones/{idVersion}/archivar
     */
    @PutMapping("/{idArticulo}/versiones/{idVersion}/archivar")
    public ResponseEntity<ArticuloVersionResponse> archivarVersion(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion) {
        log.info("PUT /api/articulos/{}/versiones/{}/archivar", idArticulo, idVersion);
        ArticuloVersionResponse response = versionService.archivarVersion(idVersion);
        return ResponseEntity.ok(response);
    }

    /**
     * Rechaza una versión propuesta.
     * PUT /api/articulos/{idArticulo}/versiones/{idVersion}/rechazar
     */
    @PutMapping("/{idArticulo}/versiones/{idVersion}/rechazar")
    public ResponseEntity<ArticuloVersionResponse> rechazarVersion(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion) {
        log.info("PUT /api/articulos/{}/versiones/{}/rechazar", idArticulo, idVersion);
        ArticuloVersionResponse response = versionService.rechazarVersion(idVersion);
        return ResponseEntity.ok(response);
    }

    // ===================== ENDPOINTS DE FEEDBACK =====================

    /**
     * Registra feedback para una versión.
     * POST /api/articulos/feedback
     */
    @PostMapping("/feedback")
    public ResponseEntity<FeedbackResponse> registrarFeedback(@Valid @RequestBody FeedbackRequest request) {
        log.info("POST /api/articulos/feedback");
        FeedbackResponse response = feedbackService.registrarFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Registra feedback rápido (útil/no útil).
     * POST /api/articulos/{idArticulo}/versiones/{idVersion}/feedback-rapido
     */
    @PostMapping("/{idArticulo}/versiones/{idVersion}/feedback-rapido")
    public ResponseEntity<FeedbackResponse> feedbackRapido(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion,
            @RequestParam Long idEmpleado,
            @RequestParam Boolean util) {
        log.info("POST /api/articulos/{}/versiones/{}/feedback-rapido?util={}", idArticulo, idVersion, util);
        FeedbackResponse response = feedbackService.registrarFeedbackRapido(idVersion, idEmpleado, util);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene los feedbacks de una versión.
     * GET /api/articulos/{idArticulo}/versiones/{idVersion}/feedbacks
     */
    @GetMapping("/{idArticulo}/versiones/{idVersion}/feedbacks")
    public ResponseEntity<List<FeedbackResponse>> obtenerFeedbacksDeVersion(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion) {
        log.info("GET /api/articulos/{}/versiones/{}/feedbacks", idArticulo, idVersion);
        List<FeedbackResponse> response = feedbackService.obtenerFeedbacksDeVersion(idVersion);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene estadísticas de feedback de una versión.
     * GET /api/articulos/{idArticulo}/versiones/{idVersion}/estadisticas
     */
    @GetMapping("/{idArticulo}/versiones/{idVersion}/estadisticas")
    public ResponseEntity<FeedbackEstadisticasResponse> obtenerEstadisticas(
            @PathVariable Integer idArticulo,
            @PathVariable Integer idVersion) {
        log.info("GET /api/articulos/{}/versiones/{}/estadisticas", idArticulo, idVersion);
        FeedbackEstadisticasResponse response = feedbackService.obtenerEstadisticas(idVersion);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene todos los feedbacks de un artículo (paginado).
     * GET /api/articulos/{idArticulo}/feedbacks
     */
    @GetMapping("/{idArticulo}/feedbacks")
    public ResponseEntity<PaginaResponse<FeedbackResponse>> obtenerFeedbacksDeArticulo(
            @PathVariable Integer idArticulo,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanio) {
        log.info("GET /api/articulos/{}/feedbacks", idArticulo);
        PaginaResponse<FeedbackResponse> response = feedbackService.obtenerFeedbacksDeArticulo(idArticulo, pagina,
                tamanio);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un feedback.
     * DELETE /api/articulos/feedback/{idFeedback}
     */
    @DeleteMapping("/feedback/{idFeedback}")
    public ResponseEntity<Void> eliminarFeedback(
            @PathVariable Integer idFeedback,
            @RequestParam Long idEmpleado) {
        log.info("DELETE /api/articulos/feedback/{}", idFeedback);
        feedbackService.eliminarFeedback(idFeedback, idEmpleado);
        return ResponseEntity.noContent().build();
    }

    // ===================== ENDPOINTS DE GENERACIÓN CON IA =====================

    /**
     * Genera un artículo completo desde la documentación de un ticket usando IA (Gemini).
     * Analiza el problema, solución, contexto del ticket y genera:
     * - Título optimizado
     * - Resumen
     * - Contenido estructurado en HTML
     * - Tags relevantes
     * - Categoría sugerida
     * 
     * El artículo se crea como BORRADOR para revisión antes de publicar.
     * 
     * POST /api/articulos/generar-ia
     */
    @PostMapping("/generar-ia")
    public ResponseEntity<GenerarArticuloIAResponse> generarArticuloConIA(
            @Valid @RequestBody GenerarArticuloIARequest request) {
        log.info("POST /api/articulos/generar-ia - Documentación ID: {}", request.getIdDocumentacion());
        GenerarArticuloIAResponse response = articuloIAService.generarArticuloDesdeDocumentacion(request);
        
        if (response.isExito()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Genera un preview del artículo sin guardarlo en base de datos.
     * Útil para que el usuario revise el contenido generado antes de confirmar.
     * 
     * POST /api/articulos/preview-ia
     */
    @PostMapping("/preview-ia")
    public ResponseEntity<GenerarArticuloIAResponse> previewArticuloConIA(
            @Valid @RequestBody GenerarArticuloIARequest request) {
        log.info("POST /api/articulos/preview-ia - Documentación ID: {}", request.getIdDocumentacion());
        GenerarArticuloIAResponse response = articuloIAService.previewArticuloDesdeDocumentacion(request);
        
        if (response.isExito()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
