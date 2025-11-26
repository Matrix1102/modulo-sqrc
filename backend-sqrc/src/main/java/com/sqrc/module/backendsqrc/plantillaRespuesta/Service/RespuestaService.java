package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.RespuestaRepository;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.RespuestaCliente;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class RespuestaService {
    // 1. Inyectamos TODOS nuestros "trabajadores"
    private final RespuestaRepository respuestaRepository;
    // private final AsignacionRepository asignacionRepository; // Asumo que tienes esto
    private final PlantillaService plantillaService;
    private final RenderService renderService;
    private final PdfService pdfService;
    private final EmailService emailService;

    public RespuestaService(RespuestaRepository respuestaRepository, PlantillaService plantillaService, RenderService renderService, PdfService pdfService, EmailService emailService) {
        this.respuestaRepository = respuestaRepository;
        this.plantillaService = plantillaService;
        this.renderService = renderService;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }

    @Transactional
    public void procesarYEnviarRespuesta(EnviarRespuestaRequestDTO request) {

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

        // PASO 6 (Opcional): Actualizar el estado de la Asignación a "ATENDIDO"
        // asignacion.setEstado(Estado.ATENDIDO);
        // asignacionRepository.save(asignacion);
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
