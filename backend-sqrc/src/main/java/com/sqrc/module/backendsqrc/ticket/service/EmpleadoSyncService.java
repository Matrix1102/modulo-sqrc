package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.EmpleadoExternoDTO;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.TipoEmpleado;
import com.sqrc.module.backendsqrc.ticket.repository.EmpleadoRepository;
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
 * Solo sincroniza agentes de call center (AGENTE_LLAMADA).
 * Los demás tipos de empleados (SUPERVISOR, BACKOFFICE, AGENTE_PRESENCIAL)
 * se manejan localmente en la BD.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmpleadoSyncService {

    private final EmpleadoRepository empleadoRepository;
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
     * Sincroniza un empleado externo a la BD local.
     * Busca por DNI: si ya existe → actualiza, si no existe → inserta.
     * Asigna tipo AGENTE_LLAMADA o AGENTE_PRESENCIAL alternadamente.
     * 
     * @param externo DTO del empleado externo
     * @param index Índice del empleado en la lista (para alternar tipos)
     */
    private void sincronizarEmpleado(EmpleadoExternoDTO externo, int index) {
        // Buscar por DNI en lugar de ID (ya que los IDs pueden no coincidir)
        Optional<Empleado> existente = empleadoRepository.findByDni(externo.getDocumentoIdentidad());

        Empleado empleado;
        if (existente.isPresent()) {
            empleado = existente.get();
            log.debug("Actualizando empleado existente DNI: {}", externo.getDocumentoIdentidad());
        } else {
            empleado = new Empleado();
            log.debug("Creando nuevo empleado DNI: {}", externo.getDocumentoIdentidad());
        }

        // Mapear campos del DTO externo a la entidad local
        empleado.setNombre(externo.getNombres());
        empleado.setApellido(externo.getApellidoCompleto());
        empleado.setDni(externo.getDocumentoIdentidad());
        empleado.setCorreo(externo.getEmail());
        empleado.setNumeroCelular(externo.getTelefono());
        empleado.setFechaNacimiento(externo.getFechaNacimiento());
        empleado.setArea(externo.getArea());

        empleado = empleadoRepository.save(empleado);

        // Asignar tipo usando SQL nativo (alternar entre LLAMADA y PRESENCIAL)
        // Índices pares = AGENTE_LLAMADA, impares = AGENTE_PRESENCIAL
        String tipoAsignado = (index % 2 == 0) 
                ? TipoEmpleado.AGENTE_LLAMADA.name() 
                : TipoEmpleado.AGENTE_PRESENCIAL.name();
        
        empleadoRepository.actualizarTipoEmpleado(empleado.getIdEmpleado(), tipoAsignado);
        log.debug("Empleado {} asignado como {}", empleado.getDni(), tipoAsignado);
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
