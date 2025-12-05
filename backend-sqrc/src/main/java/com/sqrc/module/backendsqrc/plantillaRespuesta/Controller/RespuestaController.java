package com.sqrc.module.backendsqrc.plantillaRespuesta.Controller;

import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.EnviarRespuestaRequestDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.PreviewResponseDTO;
import com.sqrc.module.backendsqrc.plantillaRespuesta.DTO.RespuestaBorradorDTO; // <--- Importar nuevo DTO
import com.sqrc.module.backendsqrc.plantillaRespuesta.Service.RespuestaService; // (o RespuestaServiceSP si le pusiste así)
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}
