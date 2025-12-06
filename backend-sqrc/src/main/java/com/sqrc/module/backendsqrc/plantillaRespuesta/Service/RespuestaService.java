package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.RespuestaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.chain.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEvent;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.PlantillaDefault;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoRespuesta;
import com.sqrc.module.backendsqrc.plantillaRespuesta.observer.IRespuestaObserver;
import com.sqrc.module.backendsqrc.ticket.repository.AsignacionRepository;
import com.sqrc.module.backendsqrc.vista360.dto.ClienteBasicoDTO;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.vista360.service.Vista360Service;
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
    private final SupabaseStorageService supabaseStorageService;
    private final Vista360Service vista360Service;
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
            EmailService emailService, SupabaseStorageService supabaseStorageService, Vista360Service vista360Service,
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
        this.supabaseStorageService = supabaseStorageService;
        this.vista360Service = vista360Service;
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

    @Transactional
    public void procesarYEnviarRespuesta(EnviarRespuestaRequestDTO request) {
        // 1. Validar
        cadenaValidacion.validar(request);

        // 2. BUSCAR DATOS (Esto faltaba: Traer el Ticket y Cliente de la BD)
        Asignacion asignacion = asignacionRepository.findById(request.idAsignacion())
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada"));
        Ticket ticket = asignacion.getTicket();
        ClienteEntity cliente = ticket.getCliente();

        // 3. Obtener Plantilla
        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());

        // 4. PREPARAR VARIABLES (Aquí "llenamos los huecos")
        Map<String, Object> variablesCompletas = new HashMap<>();

        // A) Variables del Frontend (lo que editó el agente)
        if (request.variables() != null) {
            variablesCompletas.putAll(request.variables());
        }

        // B) INYECTAR VARIABLES DEL SISTEMA (La cura para tu error)
        // Java calcula "hoy" y se lo pasa a la plantilla
        variablesCompletas.put("fecha_actual", LocalDate.now().toString());

        // Java saca el ID del ticket y se lo pasa
        variablesCompletas.put("numero_ticket", ticket.getIdTicket().toString());

        // Java saca datos del cliente y se los pasa
        String nombreCompleto = (cliente != null) ? cliente.getNombres() + " " + cliente.getApellidos() : "Cliente";
        String dni = (cliente != null) ? cliente.getDni() : "";

        variablesCompletas.put("nombre_cliente", nombreCompleto);
        variablesCompletas.put("identificador_servicio", dni);
        variablesCompletas.put("asunto_ticket", ticket.getAsunto());

        // Titulo (si no viene en el request, usamos el de la plantilla)
        String titulo = (request.asunto() != null && !request.asunto().isEmpty())
                ? request.asunto()
                : plantilla.getTituloVisible();
        variablesCompletas.put("titulo", titulo);

        // 5. RENDERIZAR (Ahora sí funcionará porque tiene todos los datos)
        String htmlFinal = renderService.renderizar(plantilla.getHtmlModel(), variablesCompletas);

        // 6. GENERAR PDF
        byte[] pdfBytes = pdfService.generarPdfDesdeHtml(htmlFinal);
        String nombreArchivo = "Respuesta_Caso_" + request.idAsignacion() + ".pdf";

        // 7. SUBIR A SUPABASE
        // Importante: Ajusta el nombre del bucket a "respuestas_manuales" si es el que creaste
        String urlPublicaPdf = supabaseStorageService.uploadPdfManual(nombreArchivo, pdfBytes);

        // 8. ENVIAR EMAIL
        emailService.enviarCorreoConAdjunto(
                request.correoDestino(),
                request.asunto(),
                htmlFinal,
                pdfBytes,
                nombreArchivo
        );

        // 9. GUARDAR EN HISTORIAL
        RespuestaCliente respuesta = new RespuestaCliente();
        respuesta.setAsignacion(asignacion);
        respuesta.setPlantilla(plantilla);
        respuesta.setAsunto(request.asunto());
        respuesta.setCorreoDestino(request.correoDestino());
        respuesta.setRespuestaHtml(htmlFinal);
        respuesta.setFechaEnvio(LocalDateTime.now());
        respuesta.setFechaCreacion(LocalDateTime.now());
        respuesta.setUrlPdfGenerado(urlPublicaPdf);
        respuesta.setTipoRespuesta(TipoRespuesta.MANUAL);

        respuestaRepository.save(respuesta);

        // 10. CERRAR Y NOTIFICAR
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

            // ---------------------------------------------------------------
            // PASO 1: RECOLECTAR DATOS PUROS (Sin texto de relleno)
            // ---------------------------------------------------------------
            Map<String, Object> variables = new HashMap<>();
            variables.put("numero_ticket", ticket.getIdTicket().toString());
            variables.put("fecha_actual", LocalDateTime.now().toLocalDate().toString());
            variables.put("nombre_cliente", ticket.getCliente().getNombres() + " " + ticket.getCliente().getApellidos());
            variables.put("asunto_ticket", ticket.getAsunto()); // Ojo: en el HTML puse 'asunto_ticket'
            variables.put("identificador_servicio", ticket.getCliente().getDni());

            // Variable para buscar en BD
            String nombrePlantillaBuscada = "Confirmación Genérica";

            if (ticket instanceof Reclamo) {
                Reclamo r = (Reclamo) ticket;
                nombrePlantillaBuscada = "Confirmación de Reclamo";

                // VARIABLES ESPECÍFICAS DE RECLAMO
                variables.put("motivo", r.getMotivoReclamo());
                // Agregamos la fecha límite (muy importante para el cliente)
                // Usamos "" + para asegurar que sea String, o formatea la fecha si prefieres
                variables.put("fecha_limite", r.getFechaLimiteRespuesta() != null ? r.getFechaLimiteRespuesta().toString() : "15 días hábiles");

            } else if (ticket instanceof Queja) {
                Queja q = (Queja) ticket;
                nombrePlantillaBuscada = "Confirmación de Queja";

                // VARIABLES ESPECÍFICAS DE QUEJA
                variables.put("area", q.getAreaInvolucrada());
                variables.put("impacto", q.getImpacto()); // "Alto", "Medio", etc.

            } else if (ticket instanceof Solicitud) {
                Solicitud s = (Solicitud) ticket;
                nombrePlantillaBuscada = "Confirmación de Solicitud";

                // VARIABLES ESPECÍFICAS DE SOLICITUD
                variables.put("tipo_solicitud", s.getTipoSolicitud());

            } else if (ticket instanceof Consulta) {
                Consulta c = (Consulta) ticket;
                nombrePlantillaBuscada = "Confirmación de Consulta";

                // VARIABLES ESPECÍFICAS DE CONSULTA
                variables.put("tema", c.getTema());
            }

            // ---------------------------------------------------------------
            // PASO 2: BUSCAR LA PLANTILLA EN BD
            // ---------------------------------------------------------------
            // Movemos esto ARRIBA porque necesitamos el 'cuerpo' y 'titulo_visible' de la BD
            Plantilla plantilla = plantillaRepository.findByNombre(nombrePlantillaBuscada)
                    .orElseGet(() -> plantillaService.obtenerPorId(1L));

            // ---------------------------------------------------------------
            // PASO 3: MAPEO MANUAL DE VARIABLES FALTANTES
            // ---------------------------------------------------------------
            // Aquí conectamos la columna 'titulo_visible' con la variable '${titulo}' del HTML
            variables.put("titulo", plantilla.getTituloVisible());

            // Conectamos la columna 'despedida' con la variable '${despedida}'
            variables.put("despedida", plantilla.getDespedida());

            // ---------------------------------------------------------------
            // PASO 4: RENDERIZADO EN CAPAS (EL SECRETO)
            // ---------------------------------------------------------------

            // A. Primero cocinamos el párrafo del medio (el cuerpo específico)
            // Usamos el texto de la BD (ej: "Hola ${motivo}...") y le metemos los datos
            String cuerpoTextoDeBd = plantilla.getCuerpo();
            String cuerpoYaProcesado = renderService.renderizar(cuerpoTextoDeBd, variables);

            // B. Metemos ese párrafo cocinado dentro de las variables como "cuerpo"
            // para que el HTML Master lo reciba en ${cuerpo}
            variables.put("cuerpo", cuerpoYaProcesado);

            // C. Finalmente renderizamos el HTML completo (Master)
            // Ahora ${cuerpo} ya no es "${motivo}", sino "Cobro Indebido"
            String htmlFinal = renderService.renderizar(plantilla.getHtmlModel(), variables);

            // ---------------------------------------------------------------
            // PASO 5: GENERAR PDF Y ENVIAR (Igual que antes)
            // ---------------------------------------------------------------
            byte[] pdfBytes = pdfService.generarPdfDesdeHtml(htmlFinal);
            String nombreArchivo = "Constancia_" + ticket.getIdTicket() + ".pdf";

            String rutaObjeto = "automaticas/" + nombreArchivo;
            String urlPublicaPdf = supabaseStorageService.uploadPdfAutomatico(rutaObjeto, pdfBytes);

            emailService.enviarCorreoConAdjunto(
                    correoCliente,
                    "Registro Exitoso #" + ticket.getIdTicket(),
                    htmlFinal,
                    pdfBytes,
                    nombreArchivo
            );

            // Guardar Historial
            RespuestaCliente respuesta = new RespuestaCliente();
            respuesta.setAsignacion(asignacion);
            respuesta.setPlantilla(plantilla);
            respuesta.setAsunto("Confirmación Automática Ticket " + ticket.getIdTicket());
            respuesta.setCorreoDestino(correoCliente);
            respuesta.setRespuestaHtml(htmlFinal);
            respuesta.setFechaEnvio(LocalDateTime.now());
            respuesta.setFechaCreacion(LocalDateTime.now());
            respuesta.setUrlPdfGenerado(urlPublicaPdf);
            respuesta.setTipoRespuesta(TipoRespuesta.AUTOMATICA);

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
    @Transactional(readOnly = true)
    public List<RespuestaTablaDTO> listarHistorialRespuestas() {

        List<RespuestaCliente> respuestasBD = respuestaRepository.findAllRespuestasWithTicket();

        return respuestasBD.stream().map(respuesta -> {
            Integer idCliente = null;
            ClienteBasicoDTO datosCliente = null;

            // BLOQUE TRY-CATCH PARA DATOS CORRUPTOS
            try {
                // Navegación segura: verificamos cada paso para no tener NullPointerException
                if (respuesta.getAsignacion() != null &&
                        respuesta.getAsignacion().getTicket() != null &&
                        respuesta.getAsignacion().getTicket().getCliente() != null) {

                    int idLong = respuesta.getAsignacion().getTicket().getCliente().getIdCliente();
                    idCliente = idLong ;
                }

                if (idCliente != null) {
                    datosCliente = vista360Service.obtenerClientePorId(idCliente);
                }
            } catch (Exception e) {
                System.err.println("Error recuperando cliente para respuesta ID " + respuesta.getIdRespuesta() + ": " + e.getMessage());
                // No relanzamos el error, simplemente dejamos los datos del cliente vacíos
            }

            // Fallback si no hay datos de cliente
            if (datosCliente == null) {
                datosCliente = ClienteBasicoDTO.builder()
                        .dni("---")
                        .nombre("Desconocido")
                        .apellido("")
                        .nombreCompleto("Cliente No Encontrado")
                        .build();
            }

            // Manejo seguro del Enum y Asunto
            String tipoStr = (respuesta.getTipoRespuesta() != null) ? respuesta.getTipoRespuesta().toString() : "MANUAL";
            String asuntoStr = (respuesta.getAsunto() != null) ? respuesta.getAsunto() : "Sin Asunto";

            return new RespuestaTablaDTO(
                    respuesta.getIdRespuesta(),
                    respuesta.getFechaEnvio(),
                    idCliente,
                    datosCliente.getDni(),
                    datosCliente.getNombreCompleto() != null ? datosCliente.getNombreCompleto()
                            : datosCliente.getNombre() + " " + datosCliente.getApellido(),
                    tipoStr,
                    asuntoStr,
                    respuesta.getUrlPdfGenerado()
            );

        }).toList();
    }
}