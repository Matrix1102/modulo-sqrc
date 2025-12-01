package com.sqrc.module.backendsqrc.baseDeConocimientos.service;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloVersionRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.FeedbackArticuloRepository;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
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
 * Servicio para la gestión de versiones de artículos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArticuloVersionService {

    private final ArticuloRepository articuloRepository;
    private final ArticuloVersionRepository versionRepository;
    private final FeedbackArticuloRepository feedbackRepository;
    private final EmpleadoRepository empleadoRepository;
    private final TicketRepository ticketRepository;

    /**
     * Crea una nueva versión de un artículo.
     */
    public ArticuloVersionResponse crearVersion(Integer idArticulo, CrearVersionRequest request) {
        log.info("Creando nueva versión para artículo ID: {}", idArticulo);

        Articulo articulo = articuloRepository.findById(idArticulo)
                .orElseThrow(() -> new ArticuloNotFoundException(idArticulo));

        Empleado creador = empleadoRepository.findById(request.getIdCreador())
                .orElseThrow(() -> new OperacionInvalidaException(
                        "Empleado no encontrado con ID: " + request.getIdCreador()));

        Ticket ticketOrigen = null;
        if (request.getIdTicketOrigen() != null) {
            ticketOrigen = ticketRepository.findById(request.getIdTicketOrigen())
                    .orElseThrow(() -> new OperacionInvalidaException(
                            "Ticket no encontrado con ID: " + request.getIdTicketOrigen()));
        }

        // Obtener el siguiente número de versión
        Long totalVersiones = versionRepository.contarVersionesPorArticulo(idArticulo);
        int siguienteNumero = totalVersiones.intValue() + 1;

        ArticuloVersion nuevaVersion = ArticuloVersion.builder()
                .articulo(articulo)
                .numeroVersion(siguienteNumero)
                .contenido(request.getContenido())
                .notaCambio(request.getNotaCambio())
                .creadoPor(creador)
                .creadoEn(LocalDateTime.now())
                .esVigente(false)
                .estadoPropuesta(EstadoArticulo.BORRADOR)
                .origen(request.getOrigen() != null ? request.getOrigen() : OrigenVersion.MANUAL)
                .ticketOrigen(ticketOrigen)
                .build();

        nuevaVersion = versionRepository.save(nuevaVersion);

        // Actualizar el artículo
        articulo.setUltimoEditor(creador);
        articulo.setActualizadoEn(LocalDateTime.now());
        articuloRepository.save(articulo);

        log.info("Versión {} creada para artículo ID: {}", siguienteNumero, idArticulo);

        return mapToResponse(nuevaVersion);
    }

    /**
     * Obtiene una versión específica por su ID.
     */
    @Transactional(readOnly = true)
    public ArticuloVersionResponse obtenerPorId(Integer idVersion) {
        ArticuloVersion version = versionRepository.findById(idVersion)
                .orElseThrow(() -> new VersionNotFoundException(idVersion));
        return mapToResponse(version);
    }

    /**
     * Obtiene la versión vigente de un artículo.
     */
    @Transactional(readOnly = true)
    public ArticuloVersionResponse obtenerVersionVigente(Integer idArticulo) {
        ArticuloVersion version = versionRepository.findByArticuloIdArticuloAndEsVigenteTrue(idArticulo)
                .orElseThrow(() -> new VersionNotFoundException(
                        "No hay versión vigente para el artículo ID: " + idArticulo));
        return mapToResponse(version);
    }

    /**
     * Obtiene todas las versiones de un artículo.
     */
    @Transactional(readOnly = true)
    public List<ArticuloVersionResponse> obtenerVersionesDeArticulo(Integer idArticulo) {
        return versionRepository.findByArticuloIdArticuloOrderByNumeroVersionDesc(idArticulo).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Marca una versión como vigente (publica la versión).
     */
    public ArticuloVersionResponse marcarComoVigente(Integer idVersion) {
        log.info("Marcando versión ID: {} como vigente", idVersion);

        ArticuloVersion version = versionRepository.findById(idVersion)
                .orElseThrow(() -> new VersionNotFoundException(idVersion));

        // Verificar que esté en borrador
        if (version.getEstadoPropuesta() == EstadoArticulo.RECHAZADO) {
            throw new OperacionInvalidaException("No se puede publicar una versión rechazada");
        }

        // Desmarcar todas las versiones vigentes del artículo
        versionRepository.desmarcarVersionesVigentes(version.getArticulo().getIdArticulo());

        // Marcar esta versión como vigente
        version.marcarComoVigente();
        version = versionRepository.save(version);

        log.info("Versión ID: {} marcada como vigente", idVersion);

        return mapToResponse(version);
    }

    /**
     * Publica un artículo marcando una versión como vigente y estableciendo
     * visibilidad.
     */
    public ArticuloVersionResponse publicarArticulo(Integer idArticulo, Integer idVersion,
            PublicarArticuloRequest request) {
        log.info("Publicando artículo ID: {} con versión ID: {}", idArticulo, idVersion);

        Articulo articulo = articuloRepository.findById(idArticulo)
                .orElseThrow(() -> new ArticuloNotFoundException(idArticulo));

        ArticuloVersion version = versionRepository.findById(idVersion)
                .orElseThrow(() -> new VersionNotFoundException(idVersion));

        // Verificar que la versión pertenece al artículo
        if (!version.getArticulo().getIdArticulo().equals(idArticulo)) {
            throw new OperacionInvalidaException("La versión no pertenece al artículo especificado");
        }

        // Desmarcar todas las versiones vigentes
        versionRepository.desmarcarVersionesVigentes(idArticulo);

        // Publicar la versión
        version.publicar(request.getVigenteDesde() != null ? request.getVigenteDesde() : LocalDateTime.now());
        versionRepository.save(version);

        // Actualizar el artículo
        articulo.setVisibilidad(request.getVisibilidad());
        if (request.getVigenteDesde() != null) {
            articulo.setVigenteDesde(request.getVigenteDesde());
        }
        if (request.getVigenteHasta() != null) {
            articulo.setVigenteHasta(request.getVigenteHasta());
        }
        articuloRepository.save(articulo);

        log.info("Artículo ID: {} publicado exitosamente", idArticulo);

        return mapToResponse(version);
    }

    /**
     * Propone una versión para revisión del supervisor.
     * Cambia el estado de BORRADOR a PROPUESTO.
     */
    public ArticuloVersionResponse proponerVersion(Integer idVersion) {
        log.info("Proponiendo versión ID: {} para revisión", idVersion);

        ArticuloVersion version = versionRepository.findById(idVersion)
                .orElseThrow(() -> new VersionNotFoundException(idVersion));

        // Solo se pueden proponer versiones en borrador
        if (version.getEstadoPropuesta() != EstadoArticulo.BORRADOR) {
            throw new OperacionInvalidaException(
                    "Solo se pueden proponer versiones en estado BORRADOR. Estado actual: "
                            + version.getEstadoPropuesta());
        }

        version.setEstadoPropuesta(EstadoArticulo.PROPUESTO);
        version = versionRepository.save(version);

        log.info("Versión ID: {} propuesta para revisión", idVersion);

        return mapToResponse(version);
    }

    /**
     * Archiva una versión.
     */
    public ArticuloVersionResponse archivarVersion(Integer idVersion) {
        log.info("Archivando versión ID: {}", idVersion);

        ArticuloVersion version = versionRepository.findById(idVersion)
                .orElseThrow(() -> new VersionNotFoundException(idVersion));

        version.archivar(LocalDateTime.now());
        version = versionRepository.save(version);

        log.info("Versión ID: {} archivada", idVersion);

        return mapToResponse(version);
    }

    /**
     * Rechaza una versión propuesta.
     */
    public ArticuloVersionResponse rechazarVersion(Integer idVersion) {
        log.info("Rechazando versión ID: {}", idVersion);

        ArticuloVersion version = versionRepository.findById(idVersion)
                .orElseThrow(() -> new VersionNotFoundException(idVersion));

        if (version.getEsVigente()) {
            throw new OperacionInvalidaException("No se puede rechazar una versión que está vigente");
        }

        version.rechazar();
        version = versionRepository.save(version);

        log.info("Versión ID: {} rechazada", idVersion);

        return mapToResponse(version);
    }

    /**
     * Obtiene versiones en estado borrador (paginado).
     */
    @Transactional(readOnly = true)
    public PaginaResponse<ArticuloVersionResponse> obtenerBorradores(int pagina, int tamanio) {
        Page<ArticuloVersion> page = versionRepository.findBorradores(PageRequest.of(pagina, tamanio));

        List<ArticuloVersionResponse> contenido = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginaResponse.<ArticuloVersionResponse>builder()
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
     * Busca versiones por contenido.
     */
    @Transactional(readOnly = true)
    public List<ArticuloVersionResponse> buscarEnContenido(String texto) {
        return versionRepository.buscarEnContenido(texto).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ===================== MÉTODOS DE MAPEO =====================

    private ArticuloVersionResponse mapToResponse(ArticuloVersion version) {
        Long feedbacksPositivos = feedbackRepository.contarFeedbacksUtiles(version.getIdArticuloVersion());
        Long feedbacksNegativos = feedbackRepository.contarFeedbacksNoUtiles(version.getIdArticuloVersion());
        Double calificacionPromedio = feedbackRepository.calcularCalificacionPromedio(version.getIdArticuloVersion());

        return ArticuloVersionResponse.builder()
                .idArticuloVersion(version.getIdArticuloVersion())
                .idArticulo(version.getArticulo() != null ? version.getArticulo().getIdArticulo() : null)
                .codigoArticulo(version.getArticulo() != null ? version.getArticulo().getCodigo() : null)
                .tituloArticulo(version.getArticulo() != null ? version.getArticulo().getTitulo() : null)
                .numeroVersion(version.getNumeroVersion())
                .contenido(version.getContenido())
                .notaCambio(version.getNotaCambio())
                .creadoEn(version.getCreadoEn())
                .esVigente(version.getEsVigente())
                .estadoPropuesta(version.getEstadoPropuesta())
                .origen(version.getOrigen())
                .idCreador(version.getCreadoPor() != null ? version.getCreadoPor().getIdEmpleado() : null)
                .nombreCreador(version.getCreadoPor() != null ? version.getCreadoPor().getNombre() : null)
                .idTicketOrigen(version.getTicketOrigen() != null ? version.getTicketOrigen().getIdTicket() : null)
                .feedbacksPositivos(feedbacksPositivos != null ? feedbacksPositivos : 0L)
                .feedbacksNegativos(feedbacksNegativos != null ? feedbacksNegativos : 0L)
                .calificacionPromedio(calificacionPromedio != null ? calificacionPromedio : 0.0)
                .totalFeedbacks((feedbacksPositivos != null ? feedbacksPositivos.intValue() : 0) +
                        (feedbacksNegativos != null ? feedbacksNegativos.intValue() : 0))
                .build();
    }
}
