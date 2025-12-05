package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.ArchivoDescarga;
import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.PreviewResponseDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.RespuestaBorradorDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.RespuestaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.chain.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEvent;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.PlantillaDefault;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import com.sqrc.module.backendsqrc.plantillaRespuesta.observer.IRespuestaObserver;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.ApplicationEventPublisher; // Si usas Observer de Spring
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RespuestaService {

    // --- DEPENDENCIAS ---
    private final RespuestaRepository respuestaRepository;
    private final PlantillaService plantillaService;
    private final RenderService renderService;
    private final PdfService pdfService;
    private final EmailService emailService;

    // IMPORTANTE: Necesitamos el repo para buscar por nombre
    // Asegúrate de agregar findByNombre en PlantillaRepository
    private final PlantillaRepository plantillaRepository;
    private final TicketRepository ticketRepository;
    private final AsignacionRepository asignacionRepository;
    // Lista de observadores (Patrón Observer Manual)
    private final List<IRespuestaObserver> observadores = new ArrayList<>();

    // Validadores (Chain of Responsibility)
    private final ValidarEstadoTicket validarEstado;
    private final ValidarDestinatario validarDestino;
    private final ValidarCoherenciaTipo validarCoherencia;
    private final ValidarPlantillaActiva validarVigencia;

    private ValidadorRespuesta cadenaValidacion;

    // --- CONSTRUCTOR ---
    public RespuestaService(
            RespuestaRepository respuestaRepository,
            PlantillaService plantillaService,
            RenderService renderService,
            PdfService pdfService,
            EmailService emailService,
            com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository plantillaRepo, TicketRepository ticketRepository, AsignacionRepository asignacionRepository,
            ValidarEstadoTicket validarEstado,
            ValidarDestinatario validarDestino,
            ValidarCoherenciaTipo validarCoherencia,
            ValidarPlantillaActiva validarVigencia) {
        this.respuestaRepository = respuestaRepository;
        this.plantillaService = plantillaService;
        this.renderService = renderService;
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.plantillaRepository = plantillaRepo;
        this.ticketRepository = ticketRepository;
        this.asignacionRepository = asignacionRepository;
        this.validarEstado = validarEstado;
        this.validarDestino = validarDestino;
        this.validarCoherencia = validarCoherencia;
        this.validarVigencia = validarVigencia;
    }

    // --- CONFIGURACIÓN PATRONES ---
    public void agregarObservador(IRespuestaObserver observador) {
        this.observadores.add(observador);
    }

    private void notificarObservadores(RespuestaEnviadaEvent evento) {
        for (IRespuestaObserver observador : observadores) {
            observador.actualizar(evento);
        }
    }

    @PostConstruct
    public void configurarCadena() {
        validarEstado.setSiguiente(validarDestino)
                .setSiguiente(validarVigencia)
                .setSiguiente(validarCoherencia);
        this.cadenaValidacion = validarEstado;
    }

    // =========================================================================
    // CASO 1: RESPUESTA MANUAL DEL AGENTE (Usa Chain + Observer)
    // =========================================================================
    @Transactional
    public void procesarYEnviarRespuesta(EnviarRespuestaRequestDTO request) {
        // 1. Validar
        cadenaValidacion.validar(request);

        // 2. Obtener Plantilla y Renderizar
        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());
        String htmlFinal = renderService.renderizar(plantilla.getHtmlModel(), request.variables());

        // 3. Generar PDF
        byte[] pdfBytes = pdfService.generarPdfDesdeHtml(htmlFinal);
        String nombreArchivo = "Respuesta_Caso_" + request.idAsignacion() + ".pdf";

        // 4. Enviar Email
        emailService.enviarCorreoConAdjunto(
                request.correoDestino(),
                request.asunto(),
                htmlFinal,
                pdfBytes,
                nombreArchivo
        );

        // 5. Guardar (CORREGIDO)
        // Buscamos la asignación real para vincularla
        Asignacion asignacion = asignacionRepository.findById(request.idAsignacion())
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada"));

        RespuestaCliente respuesta = new RespuestaCliente();
        respuesta.setAsignacion(asignacion); // <--- ¡VITAL! Sin esto falla.
        respuesta.setPlantilla(plantilla);
        respuesta.setAsunto(request.asunto());
        respuesta.setCorreoDestino(request.correoDestino());
        respuesta.setRespuestaHtml(htmlFinal);
        respuesta.setFechaEnvio(LocalDateTime.now());
        respuesta.setFechaCreacion(LocalDateTime.now());
        respuesta.setUrlPdfGenerado("GENERADO_MANUAL");

        respuestaRepository.save(respuesta);

        // 6. Notificar
        notificarObservadores(new RespuestaEnviadaEvent(request.idAsignacion(), request.cerrarTicket()));
    }

    @Async
    @Transactional
    public void enviarConfirmacionRegistro(Asignacion asignacion) {
        try {
            Ticket ticket = asignacion.getTicket();

            // Validación de correo
            if (ticket.getCliente() == null || ticket.getCliente().getCorreo() == null) {
                return;
            }
            String correoCliente = ticket.getCliente().getCorreo();

            // 1. DATOS COMUNES
            Map<String, Object> variables = new HashMap<>();
            variables.put("numero_ticket", ticket.getIdTicket().toString());
            variables.put("fecha_actual", LocalDateTime.now().toLocalDate().toString());
            variables.put("nombre_cliente", ticket.getCliente().getNombres() + " " + ticket.getCliente().getApellidos());
            variables.put("asunto", ticket.getAsunto());

            // Valor por defecto por si acaso
            variables.put("identificador_servicio", ticket.getCliente().getDni());

            // 2. LÓGICA POR TIPO (Usando instanceof porque no tenemos getTipoTicket)
            String nombrePlantillaBuscada = "Confirmación Genérica"; // Default

            if (ticket instanceof Reclamo) {
                Reclamo r = (Reclamo) ticket;
                nombrePlantillaBuscada = "Confirmación de Reclamo";

                variables.put("titulo", "HOJA DE RECLAMACIÓN");
                variables.put("motivo", r.getMotivoReclamo());
                variables.put("cuerpo", "Hemos registrado su reclamo sobre: <b>" + r.getMotivoReclamo() + "</b>. Tiene un plazo de atención de 15 días hábiles.");

            } else if (ticket instanceof Queja) {
                Queja q = (Queja) ticket;
                nombrePlantillaBuscada = "Confirmación de Queja";

                variables.put("titulo", "CONSTANCIA DE QUEJA");
                variables.put("area", q.getAreaInvolucrada());
                variables.put("cuerpo", "Lamentamos el inconveniente reportado en el área de <b>" + q.getAreaInvolucrada() + "</b>. Estamos revisando su caso.");

            } else if (ticket instanceof Solicitud) {
                Solicitud s = (Solicitud) ticket;
                nombrePlantillaBuscada = "Confirmación de Solicitud";

                variables.put("titulo", "CONSTANCIA DE SOLICITUD");
                variables.put("tipo_solicitud", s.getTipoSolicitud());
                variables.put("cuerpo", "Su solicitud de tipo <b>" + s.getTipoSolicitud() + "</b> ha sido ingresada correctamente.");

            } else if (ticket instanceof Consulta) {
                Consulta c = (Consulta) ticket;
                nombrePlantillaBuscada = "Confirmación de Consulta";

                variables.put("titulo", "RECEPCIÓN DE CONSULTA");
                variables.put("tema", c.getTema());
                variables.put("cuerpo", "Hemos recibido su consulta sobre: <b>" + c.getTema() + "</b>.");
            }

            variables.put("despedida", "Atentamente, Sistema de Atención al Cliente.");

            // 3. BUSCAR PLANTILLA (Si no existe la específica, usa la ID 1 como respaldo)
            Plantilla plantilla = plantillaRepository.findByNombre(nombrePlantillaBuscada)
                    .orElseGet(() -> plantillaService.obtenerPorId(1L));

            // 4. RENDERIZAR
            String htmlFinal = renderService.renderizar(plantilla.getHtmlModel(), variables);

            // 5. GENERAR PDF
            byte[] pdfBytes = pdfService.generarPdfDesdeHtml(htmlFinal);
            String nombreArchivo = "Constancia_" + ticket.getIdTicket() + ".pdf";

            // 6. ENVIAR EMAIL
            emailService.enviarCorreoConAdjunto(
                    correoCliente,
                    "Registro Exitoso #" + ticket.getIdTicket(),
                    htmlFinal,
                    pdfBytes,
                    nombreArchivo
            );

            // 7. GUARDAR HISTORIAL
            RespuestaCliente respuesta = new RespuestaCliente();
            respuesta.setAsignacion(asignacion);
            respuesta.setPlantilla(plantilla);
            respuesta.setAsunto("Confirmación Automática Ticket " + ticket.getIdTicket());
            respuesta.setCorreoDestino(correoCliente);
            respuesta.setRespuestaHtml(htmlFinal);
            respuesta.setFechaEnvio(LocalDateTime.now());
            respuesta.setFechaCreacion(LocalDateTime.now());
            respuesta.setUrlPdfGenerado("AUTO");

            respuestaRepository.save(respuesta);

            System.out.println("Confirmación enviada para el ticket " + ticket.getIdTicket());

        } catch (Exception e) {
            System.err.println("Error en confirmación automática: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public RespuestaBorradorDTO generarBorrador(Long ticketId, Long plantillaId) {

        // 1. Obtener Entidades
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

        // Aquí traemos la plantilla ESPECÍFICA de la BD (con su propio HTML)
        Plantilla plantilla = plantillaService.obtenerPorId(plantillaId);

        ClienteEntity cliente = ticket.getCliente();

        // 2. Preparar Variables (Datos del Ticket)
        Map<String, Object> variables = new HashMap<>();
        variables.put("numero_ticket", ticket.getIdTicket().toString());
        variables.put("fecha_actual", LocalDate.now().toString());
        variables.put("nombre_cliente", cliente != null ? cliente.getNombres() + " " + cliente.getApellidos() : "Cliente");
        variables.put("identificador_servicio", cliente != null ? cliente.getDni() : "");
        variables.put("asunto_ticket", ticket.getAsunto());

        // Datos Específicos por Tipo
        if (ticket instanceof Reclamo r) {
            variables.put("motivo", r.getMotivoReclamo() != null ? r.getMotivoReclamo() : "[MOTIVO]");
        } else if (ticket instanceof Queja q) {
            variables.put("area", q.getAreaInvolucrada() != null ? q.getAreaInvolucrada() : "[AREA]");
            variables.put("impacto", q.getImpacto());
        } else if (ticket instanceof Solicitud s) {
            variables.put("tipo_solicitud", s.getTipoSolicitud());
        } else if (ticket instanceof Consulta c) {
            variables.put("tema", c.getTema());
        }

        // ---------------------------------------------------------
        // PASO 3: RENDERIZAR EL CUERPO (Texto editable)
        // ---------------------------------------------------------
        // Aquí llenamos los huecos dentro del texto (ej: "Hola ${nombre}...")
        String cuerpoPrellenado = renderService.renderizar(plantilla.getCuerpo(), variables);

        // ---------------------------------------------------------
        // PASO 4: RENDERIZAR EL HTML COMPLETO (Vista Previa)
        // ---------------------------------------------------------
        // CORRECCIÓN: Usamos el HTML de la plantilla recuperada, NO el default estático.
        String htmlBase = plantilla.getHtmlModel();

        // Seguridad: Solo si por error la BD tiene null, usamos el default
        if (htmlBase == null || htmlBase.isBlank()) {
            htmlBase = PlantillaDefault.HTML_FORMAL;
        }

        // Preparamos variables para el HTML Base
        Map<String, Object> variablesVistaPrevia = new HashMap<>(variables);
        variablesVistaPrevia.put("titulo", plantilla.getTituloVisible());

        // Importante: El cuerpo ya cocinado lo pasamos como variable para el HTML
        // Convertimos \n a <br> para que se vea bien en el HTML
        variablesVistaPrevia.put("cuerpo", cuerpoPrellenado.replace("\n", "<br>"));

        variablesVistaPrevia.put("despedida", plantilla.getDespedida());

        // Renderizamos la hoja completa usando el diseño específico de ESTA plantilla
        String htmlPreview = renderService.renderizar(htmlBase, variablesVistaPrevia);

        // 5. Retornar
        return new RespuestaBorradorDTO(
                plantilla.getTituloVisible(),
                cuerpoPrellenado, // Texto plano para que el agente edite
                plantilla.getDespedida(),
                htmlPreview       // HTML visual para el iframe
        );
    }

    @Transactional(readOnly = true)
    public PreviewResponseDTO generarVistaPrevia(EnviarRespuestaRequestDTO request) {

        // 1. Obtener los datos reales de la BD
        Ticket ticket = ticketRepository.findById(request.idAsignacion())
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());
        ClienteEntity cliente = ticket.getCliente();

        // 2. Cargar las variables del sistema
        Map<String, Object> variables = new HashMap<>();
        variables.put("numero_ticket", ticket.getIdTicket().toString());
        variables.put("fecha_actual", LocalDateTime.now().toLocalDate().toString());
        variables.put("nombre_cliente", cliente != null ? cliente.getNombres() + " " + cliente.getApellidos() : "Cliente");
        variables.put("identificador_servicio", cliente != null ? cliente.getDni() : "");
        variables.put("asunto_ticket", ticket.getAsunto());

        // 3. Fusionar con variables del Frontend
        if (request.variables() != null) {
            variables.putAll(request.variables());
        }
        // Agregamos 'titulo' al mapa porque el HTML lo exige (${titulo})
        // Usamos lo que viene en 'asunto' del request, o el título de la plantilla por defecto
        String tituloParaHtml = (request.asunto() != null && !request.asunto().isEmpty())
                ? request.asunto()
                : plantilla.getTituloVisible();

        variables.put("titulo", tituloParaHtml);

        // 4. Preparar HTML e Inyectar cuerpo manualmente
        String htmlLayout = plantilla.getHtmlModel();

        // Seguridad: Si la plantilla no tiene HTML (null), usamos el default
        if (htmlLayout == null || htmlLayout.isBlank()) {
            htmlLayout = PlantillaDefault.HTML_FORMAL;
        }

        String cuerpoEditado = (String) variables.getOrDefault("cuerpo", "");
        cuerpoEditado = cuerpoEditado.replace("\n", "<br />");

        String htmlConContenido = htmlLayout.replace("${cuerpo}", cuerpoEditado);

        // 5. Renderizar final
        String htmlRenderizado = renderService.renderizar(htmlConContenido, variables);

        // 6. RETORNAR EL DTO DIRECTAMENTE
        // Usamos el asunto del request como título, o un default si viene nulo
        String tituloPreview = request.asunto() != null ? request.asunto() : "Vista Previa";

        return new PreviewResponseDTO(
                request.idPlantilla(),
                tituloPreview,
                htmlRenderizado
        );
    }
    @Transactional(readOnly = true)
    public ArchivoDescarga descargarPdfPreview(EnviarRespuestaRequestDTO request) {

        // 1. Reusamos la lógica de vista previa para obtener el HTML ya mezclado
        // (Esto ya incluye los datos del ticket y lo que escribió el agente)
        String html = generarVistaPrevia(request).htmlRenderizado();

        // 2. Convertimos ese HTML a PDF (Bytes)
        byte[] pdfBytes = pdfService.generarPdfDesdeHtml(html);

        // 3. Definimos el nombre del archivo (Lógica de Negocio)
        // Ej: "Respuesta_Reclamo_1050.pdf"
        String nombreArchivo = String.format("Respuesta_Ticket_%d.pdf", request.idAsignacion());

        // 4. Retornamos el paquete completo
        return new ArchivoDescarga(nombreArchivo, pdfBytes);
    }
}