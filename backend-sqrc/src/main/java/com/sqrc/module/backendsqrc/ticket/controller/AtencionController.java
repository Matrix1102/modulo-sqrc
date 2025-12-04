package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.dto.DesempenoAsignacionDTO;
import com.sqrc.module.backendsqrc.ticket.service.AtencionDesempenoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para exponer datos de atención a otros módulos.
 * 
 * Endpoint principal:
 * GET /api/v1/atencion/desempeno?empleado_id={id}
 * 
 * Retorna el historial de asignaciones de un empleado con información
 * del ticket y detalles específicos según el tipo (ej: impacto para Quejas).
 */
@RestController
@RequestMapping("/api/v1/atencion")
@RequiredArgsConstructor
@Slf4j
public class AtencionController {

    private final AtencionDesempenoService atencionDesempenoService;

    /**
     * Obtiene el desempeño de un empleado basado en sus asignaciones de tickets.
     *
     * @param empleadoId ID del empleado a consultar
     * @return Lista de asignaciones con datos del ticket y detalles específicos
     * 
     * Ejemplo de respuesta:
     * [
     *   {
     *     "id_asignacion": 9012,
     *     "id_ticket": 4501,
     *     "fecha_asignacion": "2025-11-01T10:00:00",
     *     "fecha_fin_asignacion": "2025-11-01T14:30:00",
     *     "estado_ticket": "CERRADO",
     *     "categoria_ticket": "QUEJA",
     *     "asunto_ticket": "Falla en sistema...",
     *     "nivel_impacto": "ALTO"
     *   }
     * ]
     */
    @GetMapping("/desempeno")
    public ResponseEntity<List<DesempenoAsignacionDTO>> getDesempenoEmpleado(
            @RequestParam("empleado_id") Long empleadoId) {
        
        log.info("GET /api/v1/atencion/desempeno?empleado_id={} - Consultando desempeño", empleadoId);

        List<DesempenoAsignacionDTO> desempeno = atencionDesempenoService.getDesempenoPorEmpleado(empleadoId);

        log.info("Retornando {} registros de desempeño para empleado_id={}", desempeno.size(), empleadoId);
        
        return ResponseEntity.ok(desempeno);
    }

    /**
     * Health check del controlador de atención
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("AtencionController está operativo");
    }
}
