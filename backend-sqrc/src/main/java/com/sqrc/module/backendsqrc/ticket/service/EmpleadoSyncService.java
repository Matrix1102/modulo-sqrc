package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.EmpleadoExternoDTO;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.ticket.repository.AgenteLlamadaRepository;
import com.sqrc.module.backendsqrc.ticket.repository.AgentePresencialRepository;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
import com.sqrc.module.backendsqrc.ticket.repository.SupervisorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para sincronizar empleados desde la API externa.
 * 
 * Crea instancias de AgenteLlamada o AgentePresencial según corresponda,
 * utilizando correctamente la jerarquía de clases del diseño.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmpleadoSyncService {

    private final EmpleadoRepository empleadoRepository;
    private final AgenteLlamadaRepository agenteLlamadaRepository;
    private final AgentePresencialRepository agentePresencialRepository;
    private final SupervisorRepository supervisorRepository;
    private final RestTemplate restTemplate;

    @Value("${api.empleados.url:}")
    private String apiEmpleadosUrl;

    /**
     * Sincroniza los agentes de call center desde la API externa.
     * Usa estrategia UPSERT: actualiza si existe, inserta si no.
     * 
     * @return Número de empleados sincronizados
     */
    @Transactional
    public int sincronizarAgentesCallCenter() {
        if (apiEmpleadosUrl == null || apiEmpleadosUrl.isEmpty()) {
            log.warn("URL de API de empleados no configurada. Saltando sincronización.");
            return 0;
        }

        log.info("Iniciando sincronización de agentes desde: {}", apiEmpleadosUrl);

        try {
            List<EmpleadoExternoDTO> empleadosExternos = fetchEmpleadosExternos();
            
            if (empleadosExternos == null || empleadosExternos.isEmpty()) {
                log.info("No se encontraron empleados externos para sincronizar");
                return 0;
            }

            int sincronizados = 0;
            for (int i = 0; i < empleadosExternos.size(); i++) {
                EmpleadoExternoDTO externo = empleadosExternos.get(i);
                try {
                    sincronizarEmpleado(externo, i);
                    sincronizados++;
                } catch (Exception e) {
                    log.error("Error sincronizando empleado ID {}: {}", externo.getIdEmpleado(), e.getMessage());
                }
            }

            log.info("Sincronización completada. {} empleados procesados", sincronizados);
            return sincronizados;

        } catch (Exception e) {
            log.error("Error durante la sincronización de empleados: {}", e.getMessage(), e);
            return 0;
        }
    }

    /**
     * Obtiene la lista de empleados desde la API externa.
     */
    private List<EmpleadoExternoDTO> fetchEmpleadosExternos() {
        try {
            HttpHeaders headers = new HttpHeaders();
            // Header requerido por ngrok para evitar página de advertencia
            headers.set("ngrok-skip-browser-warning", "true");
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List<EmpleadoExternoDTO>> response = restTemplate.exchange(
                    apiEmpleadosUrl,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<EmpleadoExternoDTO>>() {}
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error al obtener empleados de la API externa: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Sincroniza un empleado externo a la BD local usando las clases correctas.
     * Crea AgenteLlamada o AgentePresencial según el índice (alternando 50/50).
     * 
     * @param externo DTO del empleado externo
     * @param index Índice del empleado en la lista (para alternar tipos)
     */
    private void sincronizarEmpleado(EmpleadoExternoDTO externo, int index) {
        // Buscar por DNI en lugar de ID
        Optional<Empleado> existente = empleadoRepository.findByDni(externo.getDocumentoIdentidad());
        
        // Si ya existe, solo actualizamos campos básicos
        if (existente.isPresent()) {
            Empleado empleado = existente.get();
            empleado.setNombre(externo.getNombres());
            empleado.setApellido(externo.getApellidoCompleto());
            empleado.setCorreo(externo.getEmail());
            empleado.setNumeroCelular(externo.getTelefono());
            empleado.setFechaNacimiento(externo.getFechaNacimiento());
            empleado.setArea(externo.getArea());
            empleadoRepository.save(empleado);
            log.debug("Actualizado empleado existente DNI: {}", externo.getDocumentoIdentidad());
            return;
        }

        // Obtener supervisor por defecto (ID 1)
        Supervisor supervisorDefault = supervisorRepository.findById(1L).orElse(null);
        
        // Crear nuevo empleado usando la clase correcta según índice
        boolean esAgenteLlamada = (index % 2 == 0);
        
        if (esAgenteLlamada) {
            AgenteLlamada agente = AgenteLlamada.builder()
                    .nombre(externo.getNombres())
                    .apellido(externo.getApellidoCompleto())
                    .dni(externo.getDocumentoIdentidad())
                    .correo(externo.getEmail())
                    .numeroCelular(externo.getTelefono())
                    .fechaNacimiento(externo.getFechaNacimiento())
                    .area(externo.getArea())
                    .canalOrigen(OrigenTicket.LLAMADA)
                    .supervisor(supervisorDefault)
                    .estaOcupado(false)
                    .extensionTelefonica(String.format("1%02d", 10 + index)) // 110, 112, 114...
                    .llamadasAtendidasHoy(0)
                    .tiempoPromedioLlamada(0)
                    .llamadasActivas(0)
                    .build();
            agenteLlamadaRepository.save(agente);
            log.info("Creado AgenteLlamada: {} {} (DNI: {})", 
                    externo.getNombres(), externo.getApellidoCompleto(), externo.getDocumentoIdentidad());
        } else {
            AgentePresencial agente = AgentePresencial.builder()
                    .nombre(externo.getNombres())
                    .apellido(externo.getApellidoCompleto())
                    .dni(externo.getDocumentoIdentidad())
                    .correo(externo.getEmail())
                    .numeroCelular(externo.getTelefono())
                    .fechaNacimiento(externo.getFechaNacimiento())
                    .area(externo.getArea())
                    .canalOrigen(OrigenTicket.PRESENCIAL)
                    .supervisor(supervisorDefault)
                    .estaOcupado(false)
                    .ventanilla(String.format("V-%02d", 10 + index)) // V-11, V-13, V-15...
                    .sede("Sede Central")
                    .clientesAtendidosHoy(0)
                    .build();
            agentePresencialRepository.save(agente);
            log.info("Creado AgentePresencial: {} {} (DNI: {})", 
                    externo.getNombres(), externo.getApellidoCompleto(), externo.getDocumentoIdentidad());
        }
    }

    /**
     * Obtiene todos los empleados de un tipo específico.
     */
    public List<Empleado> obtenerEmpleadosPorTipo(TipoEmpleado tipo) {
        return empleadoRepository.findByTipoEmpleado(tipo);
    }

    /**
     * Obtiene todos los agentes (llamada + presencial + sincronizados).
     */
    public List<Empleado> obtenerTodosLosAgentes() {
        return empleadoRepository.findByTipoEmpleadoIn(
                List.of(TipoEmpleado.AGENTE_LLAMADA, TipoEmpleado.AGENTE_PRESENCIAL, TipoEmpleado.AGENTE)
        );
    }

    /**
     * Obtiene todos los empleados.
     */
    public List<Empleado> obtenerTodosLosEmpleados() {
        return empleadoRepository.findAll();
    }
}
