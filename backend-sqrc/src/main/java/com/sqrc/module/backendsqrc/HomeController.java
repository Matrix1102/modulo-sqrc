package com.sqrc.module.backendsqrc;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;

import java.util.Map;

/**
 * Controlador para la página de inicio de la API.
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "SQRC - Sistema de Quejas, Reclamos y Consultas");
        response.put("version", "1.0.0");
        response.put("status", "running");
        response.put("timestamp", LocalDateTime.now());
        response.put("endpoints", Map.of(
            "tickets", Map.of(
                "crear", "POST /api/tickets",
                "listar", "GET /api/tickets",
                "detalle", "GET /api/tickets/{id}",
                "escalar", "POST /api/tickets/{id}/escalar",
                "derivar", "POST /api/tickets/{id}/derivar",
                "cerrar", "POST /api/tickets/{id}/cerrar"
            ),
            "documentacion", Map.of(
                "agregar", "POST /api/tickets/{ticketId}/documentacion",
                "listar", "GET /api/tickets/{ticketId}/documentacion"
            ),
            "llamadas", Map.of(
                "iniciar", "POST /api/llamadas/iniciar",
                "finalizar", "POST /api/llamadas/{id}/finalizar",
                "registrar_ticket", "POST /api/llamadas/{id}/registrar-ticket"
            ),
            "vista360", Map.of(
                "buscar_cliente", "GET /api/vista360/clientes/buscar?dni={dni}",
                "detalle_cliente", "GET /api/vista360/clientes/{id}"
            )
        ));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> apiInfo() {
        return home();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
