package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.RespuestaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.chain.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEvent;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import com.sqrc.module.backendsqrc.plantillaRespuesta.observer.IRespuestaObserver;

import com.sqrc.module.backendsqrc.ticket.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.context.ApplicationEventPublisher; // Si usas Observer de Spring
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository plantillaRepo,
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

        // 5. Guardar
        RespuestaCliente respuesta = new RespuestaCliente();
        respuesta.setPlantilla(plantilla);
        respuesta.setAsunto(request.asunto());
        respuesta.setCorreoDestino(request.correoDestino());
        respuesta.setRespuestaHtml(htmlFinal);
        respuesta.setFechaEnvio(LocalDateTime.now());
        respuesta.setFechaCreacion(LocalDateTime.now());
        respuesta.setUrlPdfGenerado("GENERADO_MANUAL");

        // (OJO: Aquí deberías setear la Asignación real buscando por ID si la entidad lo requiere)
        // respuesta.setAsignacion(asignacionRepository.findById(request.idAsignacion()).get());

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
}