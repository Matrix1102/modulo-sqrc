package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.RespuestaRepository;
// Se usa el servicio `PdfService` para generación de PDF
import com.sqrc.module.backendsqrc.plantillaRespuesta.chain.ValidadorRespuesta;
import com.sqrc.module.backendsqrc.plantillaRespuesta.chain.ValidarDestinatario;
import com.sqrc.module.backendsqrc.plantillaRespuesta.chain.ValidarEstadoTicket;
import com.sqrc.module.backendsqrc.plantillaRespuesta.event.RespuestaEnviadaEventSP;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import jakarta.annotation.PostConstruct;
// Qualifier no es necesario aquí
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class RespuestaServiceSP {
    // 1. Inyectamos TODOS nuestros "trabajadores"
    private final RespuestaRepository respuestaRepository;
    // private final AsignacionRepository asignacionRepository; // Asumo que tienes esto
    private final PlantillaService plantillaService;
    private final RenderService renderService;
    private final PdfService pdfService;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;


    //validadores de la cadena
    private final ValidarEstadoTicket validarEstado;
    private final ValidarDestinatario validarDestino;
    // Variable para guardar la cabeza de la cadena
    private ValidadorRespuesta cadenaValidacion;

    public RespuestaServiceSP(RespuestaRepository respuestaRepository, PlantillaService plantillaService, RenderService renderService, PdfService pdfService, EmailService emailService, ApplicationEventPublisher eventPublisher, ValidarEstadoTicket validarEstado, ValidarDestinatario validarDestino) {
        this.respuestaRepository = respuestaRepository;
        this.plantillaService = plantillaService;
        this.renderService = renderService;
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.eventPublisher = eventPublisher;
        this.validarEstado = validarEstado;
        this.validarDestino = validarDestino;
    }

    //configuracion de la cadena
    @PostConstruct
    public void configurarCadena() {
        //definimos el orden: Primero Estado -> Luego Destino
        validarEstado.setSiguiente(validarDestino);

        // Guardamos la referencia al primero para usarlo luego
        this.cadenaValidacion = validarEstado;
    }


    @Transactional
    public void procesarYEnviarRespuesta(EnviarRespuestaRequestDTO request) {

        System.out.println("inicia validaciones de cadena");
        // Si algo falla aquí, lanza excepción y se detiene todo el proceso.
        cadenaValidacion.validar(request);

        //paso1: Obtener datos base
        // Asignacion asignacion = asignacionRepository.findById(request.idAsignacion())
        //        .orElseThrow(() -> new RuntimeException("Asignación no encontrada"));

        //pas2: falta crear estas clases
        //Ticket ticket = asignacion.getTicket();
        //Cliente cliente = ticket.getCliente();

        // 3. Preparamos las variables AUTOMÁTICAS
        // (Datos que NO pedimos al usuario, los sacamos de la BD)
        Map<String, Object> variablesDelSistema = new HashMap<>();

        /*variablesDelSistema.put("nombre_cliente", cliente.getNombre());
        variablesDelSistema.put("dni_cliente", cliente.getDni());
        variablesDelSistema.put("numero_ticket", ticket.getIdTicket());
        variablesDelSistema.put("asunto_ticket", ticket.getAsunto());
        variablesDelSistema.put("fecha_actual", LocalDate.now().toString());*/

        // 4. Fusionamos con las variables MANUALES que vienen del Front
        // (Por si la plantilla pide algo que no está en la BD, como "motivo_especifico")
        if (request.variables() != null) {
            variablesDelSistema.putAll(request.variables());
        }

        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());

        // PASO 2: Cocinar el HTML (Reemplazar variables)
        // Usamos el HTML de la BD + las variables que vienen del Front
        String htmlFinal = renderService.renderizar(plantilla.getHtmlModel(), request.variables());

        // PASO 3: Generar el PDF (En memoria)
        byte[] pdfBytes = pdfService.generarPdfDesdeHtml(htmlFinal);

        // Generamos un nombre de archivo bonito: "Respuesta_Ticket_999.pdf"
        String nombreArchivo = "Respuesta_Caso_" + request.idAsignacion() + ".pdf";

        // PASO 4: Enviar el correo
        emailService.enviarCorreoConAdjunto(
                request.correoDestino(),
                request.asunto(),
                // Puedes usar el mismo HTML para el cuerpo del correo, o un texto simple.
                // Aquí usamos el HTML renderizado también para el cuerpo del mail.
                htmlFinal,
                pdfBytes,
                nombreArchivo
        );

        // PASO 5: Guardar el historial en BD
        RespuestaCliente respuesta = new RespuestaCliente();
        // respuesta.setAsignacion(asignacion); // Descomenta cuando tengas la entidad Asignacion
        respuesta.setPlantilla(plantilla);
        respuesta.setAsunto(request.asunto());
        respuesta.setCorreoDestino(request.correoDestino());
        respuesta.setRespuestaHtml(htmlFinal); // Guardamos qué se le envió exactamente
        respuesta.setFechaEnvio(LocalDateTime.now());
        respuesta.setFechaCreacion(LocalDateTime.now());

        // Opcional: Podrías guardar la URL si subes el PDF a S3,
        // pero por ahora lo dejamos vacío o guardamos un indicador.
        respuesta.setUrlPdfGenerado("GENERADO_EN_VIVO");

        respuestaRepository.save(respuesta);

        System.out.println("📢 [SUBJECT] Correo enviado. Publicando evento...");

        //dispara el eventi
        eventPublisher.publishEvent(new RespuestaEnviadaEventSP(
                this,
                request.idAsignacion(),
                request.cerrarTicket() // Pasamos la decisión del front
        ));
    }
    @Transactional(readOnly = true) // Solo lee, no guarda nada
    public String generarVistaPrevia(EnviarRespuestaRequestDTO request) {

        // 1. Buscamos datos reales
       /* Asignacion asignacion = asignacionRepository.findById(request.idAsignacion())
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada"));

        Ticket ticket = asignacion.getTicket();
        Cliente cliente = ticket.getCliente();*/

        // 2. Preparamos variables (Igual que en el método de enviar)
        Map<String, Object> variables = new HashMap<>();
        //variables.put("nombre_cliente", cliente.getNombre());
        //variables.put("numero_ticket", ticket.getIdTicket());
        // ... agrega las demás variables automáticas aquí ...

        if (request.variables() != null) {
            variables.putAll(request.variables());
        }

        // 3. Renderizamos
        Plantilla plantilla = plantillaService.obtenerPorId(request.idPlantilla());

        // Devolvemos el HTML "cocinado" para que React lo muestre
        return renderService.renderizar(plantilla.getHtmlModel(), variables);
    }

}
