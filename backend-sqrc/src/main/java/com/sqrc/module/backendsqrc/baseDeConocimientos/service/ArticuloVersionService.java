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
 * Utiliza el patrón State para manejar las transiciones de estado de manera limpia.
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

                // La nueva versión inicia en estado BORRADOR automáticamente
                ArticuloVersion nuevaVersion = ArticuloVersion.builder()
                                .articulo(articulo)
                                .numeroVersion(siguienteNumero)
                                .contenido(request.getContenido())
                                .notaCambio(request.getNotaCambio())
                                .creadoPor(creador)
                                .creadoEn(LocalDateTime.now())
                                .esVigente(false)
                                .estadoPropuesta(EstadoArticulo.BORRADOR) // Estado inicial
                                .origen(request.getOrigen() != null ? request.getOrigen() : OrigenVersion.MANUAL)
                                .ticketOrigen(ticketOrigen)
                                .build();

                nuevaVersion = versionRepository.save(nuevaVersion);

                // Actualizar el artículo
                articulo.setUltimoEditor(creador);
                articulo.setActualizadoEn(LocalDateTime.now());
                articuloRepository.save(articulo);

                log.info("Versión {} creada para artículo ID: {} en estado {}",
                                siguienteNumero, idArticulo, nuevaVersion.getEstadoPropuesta());

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
         * Utiliza el patrón State para validar la transición.
         */
        public ArticuloVersionResponse marcarComoVigente(Integer idVersion) {
                log.info("Marcando versión ID: {} como vigente", idVersion);

                ArticuloVersion version = versionRepository.findById(idVersion)
                                .orElseThrow(() -> new VersionNotFoundException(idVersion));

                // Desmarcar todas las versiones vigentes del artículo
                versionRepository.desmarcarVersionesVigentes(version.getArticulo().getIdArticulo());

                // Usar el patrón State para publicar (validación automática de transición)
                try {
                        version.publicar();
                } catch (TransicionEstadoException e) {
                        throw new OperacionInvalidaException(e.getMessage());
                }
                
                version = versionRepository.save(version);

                log.info("Versión ID: {} marcada como vigente (estado: {})", 
                        idVersion, version.getEstadoPropuesta());

                return mapToResponse(version);
        }

        /**
         * Publica un artículo marcando una versión como vigente y estableciendo
         * visibilidad.
         * Utiliza el patrón State para validar la transición.
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

                // Usar el patrón State para publicar
                LocalDateTime fechaPublicacion = request.getVigenteDesde() != null
                                ? request.getVigenteDesde().atStartOfDay()
                                : LocalDateTime.now();
                
                try {
                        version.publicar(fechaPublicacion);
                } catch (TransicionEstadoException e) {
                        throw new OperacionInvalidaException(e.getMessage());
                }
                
                versionRepository.save(version);

                // Actualizar el artículo
                articulo.setVisibilidad(request.getVisibilidad());
                if (request.getVigenteDesde() != null) {
                        articulo.setVigenteDesde(request.getVigenteDesde().atStartOfDay());
                }
                if (request.getVigenteHasta() != null) {
                        articulo.setVigenteHasta(request.getVigenteHasta().atTime(23, 59, 59));
                }
                articuloRepository.save(articulo);

                log.info("Artículo ID: {} publicado exitosamente con versión {} (estado: {})", 
                        idArticulo, version.getNumeroVersion(), version.getEstadoPropuesta());

                return mapToResponse(version);
        }

        /**
         * Propone una versión para revisión del supervisor.
         * Utiliza el patrón State: BORRADOR → PROPUESTO
         */
        public ArticuloVersionResponse proponerVersion(Integer idVersion) {
                log.info("Proponiendo versión ID: {} para revisión", idVersion);

                ArticuloVersion version = versionRepository.findById(idVersion)
                                .orElseThrow(() -> new VersionNotFoundException(idVersion));

                // Usar el patrón State para la transición
                try {
                        version.proponer();
                } catch (TransicionEstadoException e) {
                        throw new OperacionInvalidaException(e.getMessage());
                }
                
                version = versionRepository.save(version);

                log.info("Versión ID: {} propuesta para revisión (estado: {})", 
                        idVersion, version.getEstadoPropuesta());

                return mapToResponse(version);
        }

        /**
         * Archiva una versión.
         * Utiliza el patrón State: PUBLICADO → ARCHIVADO
         */
        public ArticuloVersionResponse archivarVersion(Integer idVersion) {
                log.info("Archivando versión ID: {}", idVersion);

                ArticuloVersion version = versionRepository.findById(idVersion)
                                .orElseThrow(() -> new VersionNotFoundException(idVersion));

                // Usar el patrón State para archivar
                try {
                        version.archivar(LocalDateTime.now());
                } catch (TransicionEstadoException e) {
                        throw new OperacionInvalidaException(e.getMessage());
                }
                
                version = versionRepository.save(version);

                log.info("Versión ID: {} archivada (estado: {})", 
                        idVersion, version.getEstadoPropuesta());

                return mapToResponse(version);
        }

        /**
         * Rechaza una versión propuesta.
         * Utiliza el patrón State: PROPUESTO → RECHAZADO
         */
        public ArticuloVersionResponse rechazarVersion(Integer idVersion) {
                log.info("Rechazando versión ID: {}", idVersion);

                ArticuloVersion version = versionRepository.findById(idVersion)
                                .orElseThrow(() -> new VersionNotFoundException(idVersion));

                // Usar el patrón State para rechazar
                try {
                        version.rechazar();
                } catch (TransicionEstadoException e) {
                        throw new OperacionInvalidaException(e.getMessage());
                }
                
                version = versionRepository.save(version);

                log.info("Versión ID: {} rechazada (estado: {})", 
                        idVersion, version.getEstadoPropuesta());

                return mapToResponse(version);
        }

        /**
         * Depreca una versión publicada (cuando expira).
         * Utiliza el patrón State: PUBLICADO → DEPRECADO
         */
        public ArticuloVersionResponse deprecarVersion(Integer idVersion) {
                log.info("Deprecando versión ID: {}", idVersion);

                ArticuloVersion version = versionRepository.findById(idVersion)
                                .orElseThrow(() -> new VersionNotFoundException(idVersion));

                // Usar el patrón State para deprecar
                try {
                        version.deprecar();
                } catch (TransicionEstadoException e) {
                        throw new OperacionInvalidaException(e.getMessage());
                }
                
                version = versionRepository.save(version);

                log.info("Versión ID: {} deprecada (estado: {})", 
                        idVersion, version.getEstadoPropuesta());

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
                Double calificacionPromedio = feedbackRepository
                                .calcularCalificacionPromedio(version.getIdArticuloVersion());

                // Extraer información del creador (empleado)
                Empleado creador = version.getCreadoPor();
                String nombreCreador = creador != null ? creador.getNombre() : null;
                String apellidoCreador = creador != null ? creador.getApellido() : null;
                String nombreCompletoCreador = creador != null ? creador.getNombreCompleto() : null;

                // Extraer información del ticket origen
                Ticket ticketOrigen = version.getTicketOrigen();
                Long idTicketOrigen = ticketOrigen != null ? ticketOrigen.getIdTicket() : null;
                String asuntoTicket = ticketOrigen != null ? ticketOrigen.getAsunto() : null;
                String estadoTicket = ticketOrigen != null && ticketOrigen.getEstado() != null
                                ? ticketOrigen.getEstado().name()
                                : null;

                return ArticuloVersionResponse.builder()
                                .idArticuloVersion(version.getIdArticuloVersion())
                                .idArticulo(version.getArticulo() != null ? version.getArticulo().getIdArticulo()
                                                : null)
                                .codigoArticulo(version.getArticulo() != null ? version.getArticulo().getCodigo()
                                                : null)
                                .tituloArticulo(version.getArticulo() != null ? version.getArticulo().getTitulo()
                                                : null)
                                .numeroVersion(version.getNumeroVersion())
                                .contenido(version.getContenido())
                                .notaCambio(version.getNotaCambio())
                                .creadoEn(version.getCreadoEn())
                                .esVigente(version.getEsVigente())
                                .estadoPropuesta(version.getEstadoPropuesta())
                                .origen(version.getOrigen())
                                // Información del creador (empleado)
                                .idCreador(creador != null ? creador.getIdEmpleado() : null)
                                .nombreCreador(nombreCreador)
                                .apellidoCreador(apellidoCreador)
                                .nombreCompletoCreador(nombreCompletoCreador)
                                // Información del ticket origen
                                .idTicketOrigen(idTicketOrigen)
                                .asuntoTicket(asuntoTicket)
                                .estadoTicket(estadoTicket)
                                // Métricas
                                .feedbacksPositivos(feedbacksPositivos != null ? feedbacksPositivos : 0L)
                                .feedbacksNegativos(feedbacksNegativos != null ? feedbacksNegativos : 0L)
                                .calificacionPromedio(calificacionPromedio != null ? calificacionPromedio : 0.0)
                                .totalFeedbacks((feedbacksPositivos != null ? feedbacksPositivos.intValue() : 0) +
                                                (feedbacksNegativos != null ? feedbacksNegativos.intValue() : 0))
                                .build();
        }
}
