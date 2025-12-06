package com.sqrc.module.backendsqrc.plantillaRespuesta.Controller;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.*;
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.RespuestaService; // (o RespuestaServiceSP si le pusiste así)
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/respuestas")
@RequiredArgsConstructor
public class RespuestaController {

    private final RespuestaService respuestaService;

    // 1. ENDPOINT NUEVO: OBTENER BORRADOR
    // Se usa cuando el agente selecciona una plantilla en el combo.
    // URL: GET /api/respuestas/borrador?ticketId=100&plantillaId=5
    @GetMapping("/borrador")
    public ResponseEntity<RespuestaBorradorDTO> obtenerBorrador(
            @RequestParam Long ticketId,
            @RequestParam Long plantillaId) {

        return ResponseEntity.ok(respuestaService.generarBorrador(ticketId, plantillaId));
    }

    @PostMapping("/enviar")
    public ResponseEntity<String> enviarRespuesta(@RequestBody EnviarRespuestaRequestDTO request) {

        // Llamamos a tu método maestro
        respuestaService.procesarYEnviarRespuesta(request);

        return ResponseEntity.ok("Respuesta enviada y procesada correctamente.");
    }

    @PostMapping("/preview")
    public ResponseEntity<PreviewResponseDTO> obtenerVistaPrevia(@RequestBody EnviarRespuestaRequestDTO request) {
        // El servicio ya devuelve el objeto completo
        return ResponseEntity.ok(respuestaService.generarVistaPrevia(request));
    }
    @PostMapping("/descargar-preview")
    public ResponseEntity<byte[]> descargarPdf(@RequestBody EnviarRespuestaRequestDTO request) {

        // 1. Llamamos al servicio y recibimos el paquete completo
        ArchivoDescarga archivo = respuestaService.descargarPdfPreview(request);

        // 2. Configuramos la respuesta HTTP
        return ResponseEntity.ok()
                // El nombre del archivo viene del servicio
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + archivo.nombre() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(archivo.contenido());
    }

    @GetMapping("/historial_respuestas")
    public ResponseEntity<List<RespuestaTablaDTO>> obtenerHistorial() {
        return ResponseEntity.ok(respuestaService.listarHistorialRespuestas());
    }

}
