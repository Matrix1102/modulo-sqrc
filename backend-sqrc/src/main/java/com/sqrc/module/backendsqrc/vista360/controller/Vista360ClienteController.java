package com.sqrc.module.backendsqrc.vista360.controller;

import com.sqrc.module.backendsqrc.vista360.dto.ActualizarClienteDTO;
import com.sqrc.module.backendsqrc.vista360.dto.ClienteBasicoDTO;
import com.sqrc.module.backendsqrc.vista360.dto.MetricaKPI_DTO;
import com.sqrc.module.backendsqrc.vista360.service.Vista360Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el módulo Vista 360 Cliente.
 * Expone endpoints para consultar y actualizar información básica del cliente,
 * así como obtener métricas KPI de atención.
 */
@RestController
@RequestMapping("/api/v1/vista360/cliente")
@RequiredArgsConstructor
@Slf4j
public class Vista360ClienteController {

    private final Vista360Service vista360Service;

    /**
     * Obtiene los datos básicos de un cliente por su ID.
     *
     * @param id ID del cliente
     * @return ResponseEntity con ClienteBasicoDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClienteBasicoDTO> obtenerClientePorId(@PathVariable Integer id) {
        log.info("GET /api/v1/vista360/cliente/{} - Obteniendo datos del cliente", id);
        
        ClienteBasicoDTO cliente = vista360Service.obtenerClientePorId(id);
        
        return ResponseEntity.ok(cliente);
    }

    /**
     * Busca un cliente por su DNI.
     *
     * @param dni Documento Nacional de Identidad (8 dígitos)
     * @return ResponseEntity con ClienteBasicoDTO
     */
    @GetMapping("/buscar")
    public ResponseEntity<ClienteBasicoDTO> buscarClientePorDni(@RequestParam String dni) {
        log.info("GET /api/v1/vista360/cliente/buscar?dni={} - Buscando cliente por DNI", dni);
        
        ClienteBasicoDTO cliente = vista360Service.obtenerClientePorDni(dni);
        
        return ResponseEntity.ok(cliente);
    }

    /**
     * Actualiza la información del cliente (operación PATCH).
     * Actualiza todos los campos excepto idCliente.
     *
     * @param id ID del cliente a actualizar
     * @param datosActualizados DTO con los campos a actualizar
     * @return ResponseEntity con ClienteBasicoDTO actualizado
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ClienteBasicoDTO> actualizarInformacionCliente(
            @PathVariable Integer id,
            @Valid @RequestBody ActualizarClienteDTO datosActualizados) {
        
        log.info("PATCH /api/v1/vista360/cliente/{} - Actualizando información del cliente", id);
        
        ClienteBasicoDTO clienteActualizado = vista360Service.actualizarInformacionCliente(id, datosActualizados);
        
        return ResponseEntity.ok(clienteActualizado);
    }

    /**
     * Obtiene las métricas KPI de un cliente para las tarjetas de estadísticas.
     * Retorna 4 métricas:
     * 1. Tiempo Promedio de Solución
     * 2. Tickets Abiertos
     * 3. Calificación de la Atención
     * 4. Tickets del Último Mes
     *
     * @param id ID del cliente
     * @return ResponseEntity con lista de MetricaKPI_DTO
     */
    @GetMapping("/{id}/metricas")
    public ResponseEntity<List<MetricaKPI_DTO>> obtenerMetricasCliente(@PathVariable Integer id) {
        log.info("GET /api/v1/vista360/cliente/{}/metricas - Obteniendo métricas KPI", id);
        
        List<MetricaKPI_DTO> metricas = vista360Service.obtenerMetricasCliente(id);
        
        return ResponseEntity.ok(metricas);
    }

    /**
     * Endpoint de prueba para verificar que el controlador está funcionando.
     *
     * @return ResponseEntity con mensaje de salud
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Vista360ClienteController está operativo");
    }
}
