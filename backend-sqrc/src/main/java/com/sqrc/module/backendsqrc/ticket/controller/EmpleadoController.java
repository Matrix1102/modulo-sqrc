package com.sqrc.module.backendsqrc.ticket.controller;

import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.TipoEmpleado;
import com.sqrc.module.backendsqrc.ticket.service.EmpleadoSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestión de empleados.
 * 
 * Endpoints:
 * - GET  /api/empleados                    -> Listar todos los empleados
 * - GET  /api/empleados?tipo=AGENTE_LLAMADA -> Listar por tipo
 * - GET  /api/empleados/agentes            -> Listar todos los agentes
 * - POST /api/empleados/sync               -> Sincronizar desde API externa
 */
@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
@Slf4j
public class EmpleadoController {

    private final EmpleadoSyncService empleadoSyncService;

    /**
     * Lista todos los empleados o filtra por tipo.
     * 
     * @param tipo Tipo de empleado (opcional): SUPERVISOR, BACKOFFICE, AGENTE_LLAMADA, AGENTE_PRESENCIAL
     * @return Lista de empleados
     */
    @GetMapping
    public ResponseEntity<List<EmpleadoDTO>> listarEmpleados(
            @RequestParam(required = false) String tipo) {
        
        List<Empleado> empleados;
        
        if (tipo != null && !tipo.isEmpty()) {
            try {
                TipoEmpleado tipoEmpleado = TipoEmpleado.valueOf(tipo.toUpperCase());
                log.info("GET /api/empleados?tipo={} - Listando empleados por tipo", tipoEmpleado);
                empleados = empleadoSyncService.obtenerEmpleadosPorTipo(tipoEmpleado);
            } catch (IllegalArgumentException e) {
                log.warn("Tipo de empleado inválido: {}", tipo);
                return ResponseEntity.badRequest().build();
            }
        } else {
            log.info("GET /api/empleados - Listando todos los empleados");
            empleados = empleadoSyncService.obtenerTodosLosEmpleados();
        }
        
        List<EmpleadoDTO> dtos = empleados.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    /**
     * Lista todos los agentes (llamada + presencial).
     * 
     * @return Lista de agentes
     */
    @GetMapping("/agentes")
    public ResponseEntity<List<EmpleadoDTO>> listarAgentes() {
        log.info("GET /api/empleados/agentes - Listando todos los agentes");
        
        List<Empleado> agentes = empleadoSyncService.obtenerTodosLosAgentes();
        
        List<EmpleadoDTO> dtos = agentes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    /**
     * Sincroniza los agentes de call center desde la API externa.
     * 
     * @return Resultado de la sincronización
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sincronizarEmpleados() {
        log.info("POST /api/empleados/sync - Iniciando sincronización");
        
        int sincronizados = empleadoSyncService.sincronizarAgentesCallCenter();
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Sincronización completada");
        response.put("empleadosSincronizados", sincronizados);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Convierte entidad Empleado a DTO.
     */
    private EmpleadoDTO toDTO(Empleado empleado) {
        return EmpleadoDTO.builder()
                .idEmpleado(empleado.getIdEmpleado())
                .nombre(empleado.getNombre())
                .apellido(empleado.getApellido())
                .nombreCompleto(empleado.getNombreCompleto())
                .dni(empleado.getDni())
                .correo(empleado.getCorreo())
                .numeroCelular(empleado.getNumeroCelular())
                .area(empleado.getArea())
                .tipoEmpleado(empleado.getTipoEmpleado() != null ? empleado.getTipoEmpleado().name() : null)
                .build();
    }

    /**
     * DTO para respuesta de empleados.
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class EmpleadoDTO {
        private Long idEmpleado;
        private String nombre;
        private String apellido;
        private String nombreCompleto;
        private String dni;
        private String correo;
        private String numeroCelular;
        private String area;
        private String tipoEmpleado;
    }
}
