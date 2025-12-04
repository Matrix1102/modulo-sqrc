package com.sqrc.module.backendsqrc.baseDeConocimientos.service;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.exception.OperacionInvalidaException;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.*;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloRepository;
import com.sqrc.module.backendsqrc.baseDeConocimientos.repository.ArticuloVersionRepository;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.DocumentacionRepository;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio para generar artículos de conocimiento usando IA (Gemini).
 * Orquesta la extracción de datos desde documentación/asignación y la
 * generación con Gemini.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArticuloIAService {

    private final GeminiService geminiService;
    private final ArticuloRepository articuloRepository;
    private final ArticuloVersionRepository versionRepository;
    private final DocumentacionRepository documentacionRepository;
    private final EmpleadoRepository empleadoRepository;

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Genera un artículo completo desde la documentación de un ticket usando IA.
     * 
     * @param request Datos de la solicitud (idDocumentacion, idCreador,
     *                instrucciones)
     * @return Respuesta con el artículo generado o error
     */
    public GenerarArticuloIAResponse generarArticuloDesdeDocumentacion(GenerarArticuloIARequest request) {
        long startTime = System.currentTimeMillis();
        List<String> errores = new ArrayList<>();

        log.info("Iniciando generación de artículo con IA para documentación ID: {}", request.getIdDocumentacion());

        // Validar que Gemini esté configurado
        if (!geminiService.estaConfigurado()) {
            return GenerarArticuloIAResponse.builder()
                    .exito(false)
                    .mensaje("El servicio de IA no está configurado. Configure la API Key de Gemini.")
                    .errores(List.of("API Key de Gemini no configurada"))
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .build();
        }

        try {
            // 1. Obtener la documentación con join a asignación y ticket
            Documentacion documentacion = documentacionRepository.findById(request.getIdDocumentacion())
                    .orElseThrow(() -> new OperacionInvalidaException(
                            "Documentación no encontrada con ID: " + request.getIdDocumentacion()));

            // 2. Extraer el contexto completo
            ContextoDocumentacionDTO contexto = extraerContexto(documentacion);

            // 3. Obtener el empleado creador
            Empleado creador = empleadoRepository.findById(request.getIdCreador())
                    .orElseThrow(() -> new OperacionInvalidaException(
                            "Empleado no encontrado con ID: " + request.getIdCreador()));

            // 4. Llamar a Gemini para generar el contenido
            ArticuloGeneradoIA contenidoGenerado = geminiService.generarArticuloDesdeContexto(
                    contexto,
                    request.getInstruccionesAdicionales());

            // 5. Crear el artículo en la base de datos
            Articulo articulo = crearArticuloDesdeIA(contenidoGenerado, creador, documentacion);

            // 6. Construir la respuesta exitosa
            long tiempoProcesamiento = System.currentTimeMillis() - startTime;

            log.info("Artículo generado exitosamente con ID: {} en {}ms",
                    articulo.getIdArticulo(), tiempoProcesamiento);

            return GenerarArticuloIAResponse.builder()
                    .exito(true)
                    .mensaje("Artículo generado exitosamente con IA")
                    .articulo(mapToArticuloResponse(articulo))
                    .contenidoGenerado(contenidoGenerado)
                    .idDocumentacionOrigen(request.getIdDocumentacion())
                    .idTicketOrigen(contexto.getIdTicket())
                    .tiempoProcesamiento(tiempoProcesamiento)
                    .build();

        } catch (Exception e) {
            log.error("Error al generar artículo con IA: {}", e.getMessage(), e);
            errores.add(e.getMessage());

            return GenerarArticuloIAResponse.builder()
                    .exito(false)
                    .mensaje("Error al generar el artículo: " + e.getMessage())
                    .idDocumentacionOrigen(request.getIdDocumentacion())
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .errores(errores)
                    .build();
        }
    }

    /**
     * Genera solo el contenido (preview) sin guardar en BD.
     * Útil para que el usuario revise antes de confirmar.
     */
    @Transactional(readOnly = true)
    public GenerarArticuloIAResponse previewArticuloDesdeDocumentacion(GenerarArticuloIARequest request) {
        long startTime = System.currentTimeMillis();

        // Si no hay idDocumentacion, generar un artículo de ejemplo
        if (request.getIdDocumentacion() == null || request.getIdDocumentacion() == 0) {
            return generarArticuloEjemplo(request, startTime);
        }

        log.info("Generando preview de artículo con IA para documentación ID: {}", request.getIdDocumentacion());

        if (!geminiService.estaConfigurado()) {
            return GenerarArticuloIAResponse.builder()
                    .exito(false)
                    .mensaje("El servicio de IA no está configurado")
                    .errores(List.of("API Key de Gemini no configurada"))
                    .build();
        }

        try {
            Documentacion documentacion = documentacionRepository.findById(request.getIdDocumentacion())
                    .orElseThrow(() -> new OperacionInvalidaException(
                            "Documentación no encontrada con ID: " + request.getIdDocumentacion()));

            ContextoDocumentacionDTO contexto = extraerContexto(documentacion);

            ArticuloGeneradoIA contenidoGenerado = geminiService.generarArticuloDesdeContexto(
                    contexto,
                    request.getInstruccionesAdicionales());

            return GenerarArticuloIAResponse.builder()
                    .exito(true)
                    .mensaje("Preview generado exitosamente. Revise el contenido antes de confirmar.")
                    .contenidoGenerado(contenidoGenerado)
                    .idDocumentacionOrigen(request.getIdDocumentacion())
                    .idTicketOrigen(contexto.getIdTicket())
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .build();

        } catch (Exception e) {
            log.error("Error al generar preview: {}", e.getMessage(), e);
            return GenerarArticuloIAResponse.builder()
                    .exito(false)
                    .mensaje("Error al generar preview: " + e.getMessage())
                    .errores(List.of(e.getMessage()))
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .build();
        }
    }

    /**
     * Genera un artículo de ejemplo sin documentación previa.
     * El prompt está predefinido y genera contenido automáticamente.
     */
    @Transactional(readOnly = true)
    public GenerarArticuloIAResponse generarArticuloEjemplo(GenerarArticuloIARequest request, long startTime) {
        log.info("Generando artículo de ejemplo con IA. Tema: {}", request.getTema());

        if (!geminiService.estaConfigurado()) {
            return GenerarArticuloIAResponse.builder()
                    .exito(false)
                    .mensaje("El servicio de IA no está configurado. Configure la API Key de Gemini.")
                    .errores(List.of("API Key de Gemini no configurada"))
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .build();
        }

        try {
            ArticuloGeneradoIA contenidoGenerado = geminiService.generarArticuloDeEjemplo(
                    request.getTema(),
                    request.getEtiquetaSugerida(),
                    request.getTipoCasoSugerido());

            return GenerarArticuloIAResponse.builder()
                    .exito(true)
                    .mensaje("Artículo generado exitosamente con IA. Revise y ajuste el contenido según sea necesario.")
                    .contenidoGenerado(contenidoGenerado)
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .build();

        } catch (Exception e) {
            log.error("Error al generar artículo de ejemplo: {}", e.getMessage(), e);
            return GenerarArticuloIAResponse.builder()
                    .exito(false)
                    .mensaje("Error al generar el artículo: " + e.getMessage())
                    .errores(List.of(e.getMessage()))
                    .tiempoProcesamiento(System.currentTimeMillis() - startTime)
                    .build();
        }
    }

    /**
     * Extrae el contexto completo desde la documentación (join con asignación y
     * ticket).
     * Nota: Extraemos valores primitivos para evitar problemas de sesión lazy de
     * Hibernate.
     */
    private ContextoDocumentacionDTO extraerContexto(Documentacion documentacion) {
        Asignacion asignacion = documentacion.getAsignacion();
        if (asignacion == null) {
            throw new OperacionInvalidaException("La documentación no tiene asignación asociada");
        }

        Ticket ticket = asignacion.getTicket();
        if (ticket == null) {
            throw new OperacionInvalidaException("La asignación no tiene ticket asociado");
        }

        // Extraer valores inmediatamente para evitar problemas de sesión
        Long ticketId = ticket.getIdTicket();
        String asunto = ticket.getAsunto() != null ? ticket.getAsunto() : "";
        String descripcion = ticket.getDescripcion() != null ? ticket.getDescripcion() : "";
        String tipo = ticket.getTipoTicket() != null ? ticket.getTipoTicket().name() : "NO_DEFINIDO";
        String estado = ticket.getEstado() != null ? ticket.getEstado().name() : "NO_DEFINIDO";
        String origen = ticket.getOrigen() != null ? ticket.getOrigen().name() : "NO_DEFINIDO";
        String motivo = ticket.getMotivo() != null ? ticket.getMotivo().getNombre() : "Sin motivo";

        // Obtener información adicional según el tipo de ticket
        String infoAdicional = extraerInfoAdicionalTicket(ticket);

        // Extraer datos de asignación
        Long asignacionId = asignacion.getIdAsignacion();
        String area = asignacion.getAreaId() != null ? "Área " + asignacion.getAreaId() : "Sin área";
        String agente = asignacion.getEmpleado() != null ? asignacion.getEmpleado().getNombre() : "Sin agente";
        String fechaInicio = asignacion.getFechaInicio() != null
                ? asignacion.getFechaInicio().format(FECHA_FORMATTER)
                : "";
        String fechaFin = asignacion.getFechaFin() != null
                ? asignacion.getFechaFin().format(FECHA_FORMATTER)
                : "En curso";

        return ContextoDocumentacionDTO.builder()
                // Información del ticket
                .idTicket(ticketId)
                .asuntoTicket(asunto)
                .descripcionTicket(descripcion)
                .tipoTicket(tipo)
                .estadoTicket(estado)
                .origenTicket(origen)
                .motivoTicket(motivo)
                // Información de la documentación
                .idDocumentacion(documentacion.getIdDocumentacion())
                .problema(documentacion.getProblema())
                .solucion(documentacion.getSolucion())
                .fechaDocumentacion(documentacion.getFechaCreacion() != null
                        ? documentacion.getFechaCreacion().format(FECHA_FORMATTER)
                        : "")
                // Información de la asignación
                .idAsignacion(asignacionId)
                .areaAsignacion(area)
                .nombreAgente(agente)
                .fechaInicioAsignacion(fechaInicio)
                .fechaFinAsignacion(fechaFin)
                // Info adicional del tipo de ticket
                .infoAdicionalTipoTicket(infoAdicional)
                .build();
    }

    /**
     * Extrae información adicional según el tipo específico de ticket.
     */
    private String extraerInfoAdicionalTicket(Ticket ticket) {
        if (ticket instanceof Consulta consulta) {
            return "Tema de consulta: " + (consulta.getTema() != null ? consulta.getTema() : "No especificado");
        } else if (ticket instanceof Queja queja) {
            StringBuilder sb = new StringBuilder();
            if (queja.getImpacto() != null) {
                sb.append("Impacto: ").append(queja.getImpacto());
            }
            if (queja.getAreaInvolucrada() != null) {
                if (sb.length() > 0)
                    sb.append(". ");
                sb.append("Área involucrada: ").append(queja.getAreaInvolucrada());
            }
            return sb.toString();
        } else if (ticket instanceof Solicitud solicitud) {
            return "Tipo de solicitud: " + (solicitud.getTipoSolicitud() != null
                    ? solicitud.getTipoSolicitud()
                    : "No especificado");
        } else if (ticket instanceof Reclamo) {
            return "Tipo: Reclamo formal";
        }
        return null;
    }

    /**
     * Crea el artículo y su versión inicial desde el contenido generado por IA.
     */
    private Articulo crearArticuloDesdeIA(ArticuloGeneradoIA contenido, Empleado creador,
            Documentacion documentacion) {
        // Generar código único
        String codigo = generarCodigoUnico();

        // Crear el artículo
        Articulo articulo = Articulo.builder()
                .codigo(codigo)
                .titulo(contenido.getTitulo())
                .resumen(contenido.getResumen())
                .etiqueta(contenido.getEtiqueta())
                .tipoCaso(contenido.getTipoCaso())
                .visibilidad(contenido.getVisibilidad())
                .tags(contenido.getTags())
                .propietario(creador)
                .ultimoEditor(creador)
                .vigenteDesde(LocalDateTime.now())
                .build();

        articulo = articuloRepository.save(articulo);

        // Crear la versión inicial
        ArticuloVersion version = ArticuloVersion.builder()
                .articulo(articulo)
                .numeroVersion(1)
                .contenido(contenido.getContenido())
                .notaCambio(contenido.getNotaCambio() != null
                        ? contenido.getNotaCambio()
                        : "Artículo generado automáticamente con IA desde documentación del ticket #"
                                + documentacion.getAsignacion().getTicket().getIdTicket())
                .creadoPor(creador)
                .creadoEn(LocalDateTime.now())
                .esVigente(false) // Se publica manualmente después de revisión
                .estadoPropuesta(EstadoArticulo.BORRADOR)
                .origen(OrigenVersion.DERIVADO_DE_DOCUMENTACION)
                .ticketOrigen(documentacion.getAsignacion().getTicket())
                .build();

        versionRepository.save(version);

        // Actualizar la documentación con el ID del artículo generado
        documentacion.setIdArticuloKB(articulo.getIdArticulo());
        documentacionRepository.save(documentacion);

        log.info("Artículo creado: {} con versión inicial", articulo.getCodigo());

        return articulo;
    }

    /**
     * Genera un código único para el artículo.
     */
    private String generarCodigoUnico() {
        String prefijo = "KB-IA-";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        String uuid = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefijo + timestamp + "-" + uuid;
    }

    /**
     * Mapea el artículo a ArticuloResponse.
     */
    private ArticuloResponse mapToArticuloResponse(Articulo articulo) {
        ArticuloVersion versionVigente = articulo.getVersionVigente();
        ArticuloVersion ultimaVersion = articulo.getVersiones().isEmpty()
                ? null
                : articulo.getVersiones().get(0);

        return ArticuloResponse.builder()
                .idArticulo(articulo.getIdArticulo())
                .codigo(articulo.getCodigo())
                .titulo(articulo.getTitulo())
                .resumen(articulo.getResumen())
                .etiqueta(articulo.getEtiqueta())
                .tipoCaso(articulo.getTipoCaso())
                .visibilidad(articulo.getVisibilidad())
                .vigenteDesde(articulo.getVigenteDesde())
                .vigenteHasta(articulo.getVigenteHasta())
                .tags(articulo.getTags())
                .creadoEn(articulo.getCreadoEn())
                .actualizadoEn(articulo.getActualizadoEn())
                .idPropietario(articulo.getPropietario() != null ? articulo.getPropietario().getIdEmpleado() : null)
                .nombrePropietario(articulo.getPropietario() != null ? articulo.getPropietario().getNombre() : null)
                .versionVigente(versionVigente != null ? versionVigente.getNumeroVersion() : null)
                .estadoVersionVigente(versionVigente != null ? versionVigente.getEstadoPropuesta() : null)
                .contenidoVersionVigente(ultimaVersion != null ? ultimaVersion.getContenido() : null)
                .totalVersiones(articulo.getVersiones() != null ? articulo.getVersiones().size() : 1)
                .feedbacksPositivos(0L)
                .calificacionPromedio(0.0)
                .estaVigente(articulo.estaVigente())
                .build();
    }
}
