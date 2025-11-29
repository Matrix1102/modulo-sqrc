package com.sqrc.module.backendsqrc.vista360.service;

import com.sqrc.module.backendsqrc.vista360.dto.ClienteBasicoDTO;
import com.sqrc.module.backendsqrc.vista360.dto.MetricaKPI_DTO;
import com.sqrc.module.backendsqrc.vista360.exception.ClienteNotFoundException;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import com.sqrc.module.backendsqrc.vista360.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Servicio de aplicación para gestionar la Vista 360 del cliente.
 * Proporciona operaciones de consulta y actualización de información básica del cliente,
 * así como el cálculo de métricas KPI.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class Vista360Service {

    private final ClienteRepository clienteRepository;
    private final Random random = new Random();

    /**
     * Obtiene los datos básicos de un cliente por su ID.
     *
     * @param id ID del cliente
     * @return DTO con información básica del cliente
     * @throws ClienteNotFoundException si el cliente no existe
     */
    @Transactional(readOnly = true)
    public ClienteBasicoDTO obtenerClientePorId(Integer id) {
        log.debug("Buscando cliente por ID: {}", id);
        
        ClienteEntity cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteNotFoundException(id));

        return mapearADTO(cliente);
    }

    /**
     * Obtiene los datos básicos de un cliente por su DNI.
     *
     * @param dni Documento Nacional de Identidad
     * @return DTO con información básica del cliente
     * @throws ClienteNotFoundException si el cliente no existe
     */
    @Transactional(readOnly = true)
    public ClienteBasicoDTO obtenerClientePorDni(String dni) {
        log.debug("Buscando cliente por DNI: {}", dni);
        
        ClienteEntity cliente = clienteRepository.findByDni(dni)
                .orElseThrow(() -> new ClienteNotFoundException("DNI", dni));

        return mapearADTO(cliente);
    }

    /**
     * Actualiza la información de contacto de un cliente (correo, teléfono, celular).
     * Implementa operación PATCH para actualización parcial.
     *
     * @param id ID del cliente a actualizar
     * @param datos DTO con los datos actualizados
     * @return DTO con la información actualizada del cliente
     * @throws ClienteNotFoundException si el cliente no existe
     */
    @Transactional
    public ClienteBasicoDTO actualizarInformacionContacto(Integer id, ClienteBasicoDTO datos) {
        log.debug("Actualizando información de contacto para cliente ID: {}", id);
        
        ClienteEntity cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteNotFoundException(id));

        // Actualizar solo los campos de contacto
        if (datos.getCorreo() != null && !datos.getCorreo().isBlank()) {
            cliente.setCorreo(datos.getCorreo());
        }
        if (datos.getTelefono() != null) {
            cliente.setTelefono(datos.getTelefono());
        }
        if (datos.getCelular() != null && !datos.getCelular().isBlank()) {
            cliente.setCelular(datos.getCelular());
        }

        ClienteEntity clienteActualizado = clienteRepository.save(cliente);
        log.info("Información de contacto actualizada para cliente ID: {}", id);

        return mapearADTO(clienteActualizado);
    }

    /**
     * Obtiene las métricas KPI de un cliente.
     * Calcula o simula los 4 indicadores principales mostrados en la vista.
     *
     * @param id ID del cliente
     * @return Lista con 4 métricas KPI
     * @throws ClienteNotFoundException si el cliente no existe
     */
    @Transactional(readOnly = true)
    public List<MetricaKPI_DTO> obtenerMetricasCliente(Integer id) {
        log.debug("Calculando métricas para cliente ID: {}", id);
        
        // Verificar que el cliente existe
        if (!clienteRepository.existsById(id)) {
            throw new ClienteNotFoundException(id);
        }

        List<MetricaKPI_DTO> metricas = new ArrayList<>();

        // 1. Tiempo Promedio de Solución
        metricas.add(calcularTiempoPromedioSolucion(id));

        // 2. Tickets Abiertos
        metricas.add(calcularTicketsAbiertos(id));

        // 3. Calificación de la Atención
        metricas.add(calcularCalificacionAtencion(id));

        // 4. Tickets del Último Mes
        metricas.add(calcularTicketsUltimoMes(id));

        return metricas;
    }

    // ==================== Métodos Privados ====================

    /**
     * Mapea una entidad ClienteEntity a ClienteBasicoDTO.
     */
    private ClienteBasicoDTO mapearADTO(ClienteEntity cliente) {
        return ClienteBasicoDTO.builder()
                .idCliente(cliente.getIdCliente())
                .dni(cliente.getDni())
                .nombres(cliente.getNombres())
                .apellidos(cliente.getApellidos())
                .fechaNacimiento(cliente.getFechaNacimiento())
                .correo(cliente.getCorreo())
                .telefono(cliente.getTelefono())
                .celular(cliente.getCelular())
                .build();
    }

    /**
     * Calcula la métrica de Tiempo Promedio de Solución.
     * TODO: Implementar lógica real con datos de tickets/encuestas.
     */
    private MetricaKPI_DTO calcularTiempoPromedioSolucion(Integer idCliente) {
        // Simulación: valores entre 1.5 y 4.0 horas
        double tiempoPromedio = 1.5 + (random.nextDouble() * 2.5);
        double variacionPorcentaje = -15 + (random.nextDouble() * 30); // Entre -15% y +15%

        return MetricaKPI_DTO.builder()
                .titulo("Tiempo Promedio de Solución")
                .valorPrincipal(String.format("%.1f", tiempoPromedio))
                .unidad("hrs")
                .subtituloTendencia(String.format("%+.0f%% vs mes anterior", variacionPorcentaje))
                .estadoTendencia(variacionPorcentaje < 0 ? 
                        MetricaKPI_DTO.EstadoTendencia.POSITIVO : 
                        MetricaKPI_DTO.EstadoTendencia.NEGATIVO)
                .build();
    }

    /**
     * Calcula la métrica de Tickets Abiertos actuales.
     * TODO: Implementar consulta real a base de datos de tickets.
     */
    private MetricaKPI_DTO calcularTicketsAbiertos(Integer idCliente) {
        // Simulación: valores entre 0 y 10
        int ticketsAbiertos = random.nextInt(11);
        int diferencia = -3 + random.nextInt(7); // Entre -3 y +3

        return MetricaKPI_DTO.builder()
                .titulo("Tickets Abiertos")
                .valorPrincipal(String.valueOf(ticketsAbiertos))
                .unidad("tickets")
                .subtituloTendencia(String.format("%+d del promedio", diferencia))
                .estadoTendencia(ticketsAbiertos <= 3 ? 
                        MetricaKPI_DTO.EstadoTendencia.POSITIVO : 
                        MetricaKPI_DTO.EstadoTendencia.NEGATIVO)
                .build();
    }

    /**
     * Calcula la métrica de Calificación de la Atención.
     * TODO: Implementar cálculo basado en encuestas reales.
     */
    private MetricaKPI_DTO calcularCalificacionAtencion(Integer idCliente) {
        // Simulación: valores entre 3.5 y 5.0
        double calificacion = 3.5 + (random.nextDouble() * 1.5);
        double diferencia = -0.5 + (random.nextDouble() * 1.0); // Entre -0.5 y +0.5

        return MetricaKPI_DTO.builder()
                .titulo("Calificación de la Atención")
                .valorPrincipal(String.format("%.1f", calificacion))
                .unidad("/5")
                .subtituloTendencia(String.format("%+.1f del promedio", diferencia))
                .estadoTendencia(calificacion >= 4.0 ? 
                        MetricaKPI_DTO.EstadoTendencia.POSITIVO : 
                        (calificacion >= 3.5 ? 
                                MetricaKPI_DTO.EstadoTendencia.NEUTRO : 
                                MetricaKPI_DTO.EstadoTendencia.NEGATIVO))
                .build();
    }

    /**
     * Calcula la métrica de Tickets creados en el último mes.
     * TODO: Implementar consulta real a base de datos de tickets con filtro de fecha.
     */
    private MetricaKPI_DTO calcularTicketsUltimoMes(Integer idCliente) {
        // Simulación: valores entre 0 y 15
        int ticketsDelMes = random.nextInt(16);
        double variacionPorcentaje = -20 + (random.nextDouble() * 40); // Entre -20% y +20%

        return MetricaKPI_DTO.builder()
                .titulo("Tickets del Último Mes")
                .valorPrincipal(String.valueOf(ticketsDelMes))
                .unidad("tickets")
                .subtituloTendencia(String.format("%+.0f%% vs mes anterior", variacionPorcentaje))
                .estadoTendencia(variacionPorcentaje <= 0 ? 
                        MetricaKPI_DTO.EstadoTendencia.POSITIVO : 
                        MetricaKPI_DTO.EstadoTendencia.NEGATIVO)
                .build();
    }
}
