package com.sqrc.module.backendsqrc.baseDeConocimientos.service;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloVersionRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.FeedbackArticuloRepository;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de feedbacks de artículos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FeedbackService {

    private final FeedbackArticuloRepository feedbackRepository;
    private final ArticuloVersionRepository versionRepository;
    private final EmpleadoRepository empleadoRepository;

    /**
     * Registra un nuevo feedback para una versión de artículo.
     */
    public FeedbackResponse registrarFeedback(FeedbackRequest request) {
        log.info("Registrando feedback para versión ID: {} por empleado ID: {}",
                request.getIdVersion(), request.getIdEmpleado());

        ArticuloVersion version = versionRepository.findById(request.getIdVersion())
                .orElseThrow(() -> new VersionNotFoundException(request.getIdVersion()));

        Empleado empleado = empleadoRepository.findById(request.getIdEmpleado())
                .orElseThrow(() -> new OperacionInvalidaException(
                        "Empleado no encontrado con ID: " + request.getIdEmpleado()));

        // Verificar si ya existe feedback de este empleado para esta versión
        if (feedbackRepository.existsByArticuloVersionIdArticuloVersionAndEmpleadoIdEmpleado(
                request.getIdVersion(), request.getIdEmpleado())) {
            throw new OperacionInvalidaException(
                    "Ya existe un feedback de este empleado para esta versión. Use actualizar en su lugar.");
        }

        FeedbackArticulo feedback = FeedbackArticulo.builder()
                .articuloVersion(version)
                .empleado(empleado)
                .comentario(request.getComentario())
                .calificacion(request.getCalificacion())
                .util(request.getUtil())
                .creadoEn(LocalDateTime.now())
                .build();

        feedback = feedbackRepository.save(feedback);

        log.info("Feedback registrado con ID: {}", feedback.getIdFeedback());

        return mapToResponse(feedback);
    }

    /**
     * Actualiza un feedback existente.
     */
    public FeedbackResponse actualizarFeedback(Integer idFeedback, FeedbackRequest request) {
        log.info("Actualizando feedback ID: {}", idFeedback);

        FeedbackArticulo feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new OperacionInvalidaException("Feedback no encontrado con ID: " + idFeedback));

        // Verificar que el empleado sea el mismo
        if (!feedback.getEmpleado().getIdEmpleado().equals(request.getIdEmpleado())) {
            throw new OperacionInvalidaException("Solo el autor del feedback puede modificarlo");
        }

        if (request.getComentario() != null) {
            feedback.setComentario(request.getComentario());
        }
        if (request.getCalificacion() != null) {
            feedback.setCalificacion(request.getCalificacion());
        }
        if (request.getUtil() != null) {
            feedback.setUtil(request.getUtil());
        }

        feedback = feedbackRepository.save(feedback);

        log.info("Feedback ID: {} actualizado", idFeedback);

        return mapToResponse(feedback);
    }

    /**
     * Obtiene el feedback de un empleado para una versión específica.
     */
    @Transactional(readOnly = true)
    public FeedbackResponse obtenerFeedbackDeEmpleado(Integer idVersion, Long idEmpleado) {
        FeedbackArticulo feedback = feedbackRepository
                .findByArticuloVersionIdArticuloVersionAndEmpleadoIdEmpleado(idVersion, idEmpleado)
                .orElse(null);

        return feedback != null ? mapToResponse(feedback) : null;
    }

    /**
     * Obtiene todos los feedbacks de una versión.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponse> obtenerFeedbacksDeVersion(Integer idVersion) {
        return feedbackRepository.findByArticuloVersionIdArticuloVersion(idVersion).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene feedbacks con comentarios de una versión.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponse> obtenerFeedbacksConComentarios(Integer idVersion) {
        return feedbackRepository.findConComentarios(idVersion).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los feedbacks de un artículo (todas las versiones) paginado.
     */
    @Transactional(readOnly = true)
    public PaginaResponse<FeedbackResponse> obtenerFeedbacksDeArticulo(Integer idArticulo, int pagina, int tamanio) {
        Page<FeedbackArticulo> page = feedbackRepository.findByArticulo(idArticulo, PageRequest.of(pagina, tamanio));

        List<FeedbackResponse> contenido = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginaResponse.<FeedbackResponse>builder()
                .contenido(contenido)
                .paginaActual(page.getNumber())
                .totalPaginas(page.getTotalPages())
                .totalElementos(page.getTotalElements())
                .tamanoPagina(page.getSize())
                .esPrimera(page.isFirst())
                .esUltima(page.isLast())
                .tieneAnterior(page.hasPrevious())
                .tieneSiguiente(page.hasNext())
                .build();
    }

    /**
     * Obtiene estadísticas de feedback de una versión.
     */
    @Transactional(readOnly = true)
    public FeedbackEstadisticasResponse obtenerEstadisticas(Integer idVersion) {
        Long positivos = feedbackRepository.contarFeedbacksUtiles(idVersion);
        Long negativos = feedbackRepository.contarFeedbacksNoUtiles(idVersion);
        Double promedio = feedbackRepository.calcularCalificacionPromedio(idVersion);

        return FeedbackEstadisticasResponse.builder()
                .idVersion(idVersion)
                .feedbacksPositivos(positivos != null ? positivos : 0L)
                .feedbacksNegativos(negativos != null ? negativos : 0L)
                .totalFeedbacks((positivos != null ? positivos : 0L) + (negativos != null ? negativos : 0L))
                .calificacionPromedio(promedio != null ? promedio : 0.0)
                .build();
    }

    /**
     * Elimina un feedback.
     */
    public void eliminarFeedback(Integer idFeedback, Long idEmpleado) {
        log.info("Eliminando feedback ID: {}", idFeedback);

        FeedbackArticulo feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new OperacionInvalidaException("Feedback no encontrado con ID: " + idFeedback));

        // Verificar que el empleado sea el autor
        if (!feedback.getEmpleado().getIdEmpleado().equals(idEmpleado)) {
            throw new OperacionInvalidaException("Solo el autor del feedback puede eliminarlo");
        }

        feedbackRepository.delete(feedback);

        log.info("Feedback ID: {} eliminado", idFeedback);
    }

    /**
     * Registra feedback rápido (solo útil/no útil).
     */
    public FeedbackResponse registrarFeedbackRapido(Integer idVersion, Long idEmpleado, Boolean esUtil) {
        log.info("Registrando feedback rápido para versión ID: {}", idVersion);

        // Verificar si ya existe
        FeedbackArticulo existente = feedbackRepository
                .findByArticuloVersionIdArticuloVersionAndEmpleadoIdEmpleado(idVersion, idEmpleado)
                .orElse(null);

        if (existente != null) {
            existente.setUtil(esUtil);
            existente = feedbackRepository.save(existente);
            return mapToResponse(existente);
        }

        // Crear nuevo feedback rápido
        FeedbackRequest request = FeedbackRequest.builder()
                .idVersion(idVersion)
                .idEmpleado(idEmpleado)
                .util(esUtil)
                .build();

        return registrarFeedback(request);
    }

    // ===================== MÉTODOS DE MAPEO =====================

    private FeedbackResponse mapToResponse(FeedbackArticulo feedback) {
        return FeedbackResponse.builder()
                .idFeedback(feedback.getIdFeedback())
                .idVersion(feedback.getArticuloVersion() != null ? feedback.getArticuloVersion().getIdArticuloVersion()
                        : null)
                .numeroVersion(
                        feedback.getArticuloVersion() != null ? feedback.getArticuloVersion().getNumeroVersion() : null)
                .idArticulo(feedback.getArticuloVersion() != null && feedback.getArticuloVersion().getArticulo() != null
                        ? feedback.getArticuloVersion().getArticulo().getIdArticulo()
                        : null)
                .tituloArticulo(
                        feedback.getArticuloVersion() != null && feedback.getArticuloVersion().getArticulo() != null
                                ? feedback.getArticuloVersion().getArticulo().getTitulo()
                                : null)
                .idEmpleado(feedback.getEmpleado() != null ? feedback.getEmpleado().getIdEmpleado() : null)
                .nombreEmpleado(feedback.getEmpleado() != null ? feedback.getEmpleado().getNombre() : null)
                .comentario(feedback.getComentario())
                .calificacion(feedback.getCalificacion())
                .util(feedback.getUtil())
                .creadoEn(feedback.getCreadoEn())
                .build();
    }
}
