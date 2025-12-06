package com.sqrc.module.backendsqrc.vista360.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sqrc.module.backendsqrc.logs.service.AuditLogService;
import com.sqrc.module.backendsqrc.vista360.dto.ActualizarClienteExternoDTO;
import com.sqrc.module.backendsqrc.vista360.dto.ClienteExternoDTO;
import com.sqrc.module.backendsqrc.vista360.exception.ClienteNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Cliente HTTP para comunicarse con el API externo de clientes (mod-ventas).
 * Base URL: https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente
 * Usa WebClient para soporte nativo de PATCH.
 */
@Service
@Slf4j
public class ClienteApiClient {

    private final WebClient webClient;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Value("${api.clientes.url:https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente}")
    private String apiBaseUrl;

    public ClienteApiClient(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules(); // Para LocalDate
        this.webClient = WebClient.builder()
                .defaultHeader("ngrok-skip-browser-warning", "true")
                .build();
    }

    /**
     * Obtiene los datos de un cliente por su ID desde el API externo.
     *
     * @param idCliente ID del cliente
     * @return ClienteExternoDTO con los datos del cliente
     * @throws ClienteNotFoundException si el cliente no existe
     */
    public ClienteExternoDTO obtenerClientePorId(Integer idCliente) {
        String url = apiBaseUrl + "/" + idCliente;
        log.info("GET {} - Obteniendo cliente desde API externa", url);
        
        long startTime = System.currentTimeMillis();
        Integer responseStatus = null;
        boolean success = false;
        String errorMessage = null;

        try {
            ClienteExternoDTO cliente = webClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> {
                        if (response.statusCode().value() == 404) {
                            return Mono.error(new ClienteNotFoundException(idCliente));
                        }
                        return response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException("Error del cliente: " + body)));
                    })
                    .bodyToMono(ClienteExternoDTO.class)
                    .block();

            responseStatus = 200;
            success = true;
            long duration = System.currentTimeMillis() - startTime;
            
            // Log de integración exitosa con response payload
            String responsePayload = serializeToJson(cliente);
            auditLogService.logIntegrationFull("mod-ventas", "OBTENER_CLIENTE_POR_ID", url, 
                    "GET", responseStatus, duration, success, null, null, 
                    "idCliente=" + idCliente, responsePayload);

            log.info("Cliente obtenido exitosamente: {} {}", 
                    cliente != null ? cliente.getFirstName() : "null",
                    cliente != null ? cliente.getLastName() : "null");
            return cliente;

        } catch (ClienteNotFoundException e) {
            log.warn("Cliente no encontrado en API externa: {}", idCliente);
            responseStatus = 404;
            errorMessage = e.getMessage();
            long duration = System.currentTimeMillis() - startTime;
            auditLogService.logIntegrationFull("mod-ventas", "OBTENER_CLIENTE_POR_ID", url, 
                    "GET", responseStatus, duration, false, errorMessage, null,
                    "idCliente=" + idCliente, null);
            throw e;
        } catch (Exception e) {
            log.error("Error al obtener cliente desde API externa: {}", e.getMessage());
            responseStatus = 500;
            errorMessage = e.getMessage();
            long duration = System.currentTimeMillis() - startTime;
            auditLogService.logIntegrationFull("mod-ventas", "OBTENER_CLIENTE_POR_ID", url, 
                    "GET", responseStatus, duration, false, errorMessage, null,
                    "idCliente=" + idCliente, null);
            throw new RuntimeException("Error al comunicarse con el servicio de clientes: " + e.getMessage(), e);
        }
    }

    /**
     * Obtiene los datos de un cliente por su DNI desde el API externo.
     *
     * @param dni DNI del cliente (8 dígitos)
     * @return ClienteExternoDTO con los datos del cliente
     * @throws ClienteNotFoundException si el cliente no existe
     */
    public ClienteExternoDTO obtenerClientePorDni(String dni) {
        String url = apiBaseUrl + "/dni/" + dni;
        log.info("GET {} - Obteniendo cliente por DNI desde API externa", url);
        
        long startTime = System.currentTimeMillis();
        Integer responseStatus = null;
        boolean success = false;
        String errorMessage = null;

        try {
            ClienteExternoDTO cliente = webClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> {
                        if (response.statusCode().value() == 404) {
                            return Mono.error(new ClienteNotFoundException("dni", dni));
                        }
                        return response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException("Error del cliente: " + body)));
                    })
                    .bodyToMono(ClienteExternoDTO.class)
                    .block();

            responseStatus = 200;
            success = true;
            long duration = System.currentTimeMillis() - startTime;
            
            // Log de integración exitosa con response payload
            String responsePayload = serializeToJson(cliente);
            auditLogService.logIntegrationFull("mod-ventas", "OBTENER_CLIENTE_POR_DNI", url, 
                    "GET", responseStatus, duration, success, null, null,
                    "dni=" + dni, responsePayload);

            log.info("Cliente obtenido por DNI exitosamente: {} {}", 
                    cliente != null ? cliente.getFirstName() : "null",
                    cliente != null ? cliente.getLastName() : "null");
            return cliente;

        } catch (ClienteNotFoundException e) {
            log.warn("Cliente no encontrado por DNI en API externa: {}", dni);
            responseStatus = 404;
            errorMessage = e.getMessage();
            long duration = System.currentTimeMillis() - startTime;
            auditLogService.logIntegrationFull("mod-ventas", "OBTENER_CLIENTE_POR_DNI", url, 
                    "GET", responseStatus, duration, false, errorMessage, null,
                    "dni=" + dni, null);
            throw e;
        } catch (Exception e) {
            log.error("Error al obtener cliente por DNI desde API externa: {}", e.getMessage());
            responseStatus = 500;
            errorMessage = e.getMessage();
            long duration = System.currentTimeMillis() - startTime;
            auditLogService.logIntegrationFull("mod-ventas", "OBTENER_CLIENTE_POR_DNI", url, 
                    "GET", responseStatus, duration, false, errorMessage, null,
                    "dni=" + dni, null);
            throw new RuntimeException("Error al comunicarse con el servicio de clientes: " + e.getMessage(), e);
        }
    }

    /**
     * Actualiza los datos de un cliente en el API externo.
     *
     * @param idCliente ID del cliente a actualizar
     * @param datos     DTO con los datos a actualizar
     * @return ClienteExternoDTO con los datos actualizados
     * @throws ClienteNotFoundException si el cliente no existe
     */
    public ClienteExternoDTO actualizarCliente(Integer idCliente, ActualizarClienteExternoDTO datos) {
        String url = apiBaseUrl + "/" + idCliente;
        log.info("PATCH {} - Actualizando cliente en API externa", url);
        
        long startTime = System.currentTimeMillis();
        Integer responseStatus = null;
        boolean success = false;
        String errorMessage = null;

        try {
            ClienteExternoDTO clienteActualizado = webClient.patch()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(datos)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> {
                        if (response.statusCode().value() == 404) {
                            return Mono.error(new ClienteNotFoundException(idCliente));
                        }
                        return response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException("Error del cliente: " + body)));
                    })
                    .bodyToMono(ClienteExternoDTO.class)
                    .block();

            responseStatus = 200;
            success = true;
            long duration = System.currentTimeMillis() - startTime;
            
            // Log de integración exitosa con payloads
            String requestPayload = serializeToJson(datos);
            String responsePayload = serializeToJson(clienteActualizado);
            auditLogService.logIntegrationFull("mod-ventas", "ACTUALIZAR_CLIENTE", url, 
                    "PATCH", responseStatus, duration, success, null, null,
                    requestPayload, responsePayload);

            log.info("Cliente actualizado exitosamente: {}", idCliente);
            return clienteActualizado;

        } catch (ClienteNotFoundException e) {
            log.warn("Cliente no encontrado para actualizar: {}", idCliente);
            responseStatus = 404;
            errorMessage = e.getMessage();
            long duration = System.currentTimeMillis() - startTime;
            String requestPayload = serializeToJson(datos);
            auditLogService.logIntegrationFull("mod-ventas", "ACTUALIZAR_CLIENTE", url, 
                    "PATCH", responseStatus, duration, false, errorMessage, null,
                    requestPayload, null);
            throw e;
        } catch (Exception e) {
            log.error("Error al actualizar cliente en API externa: {}", e.getMessage());
            responseStatus = 500;
            errorMessage = e.getMessage();
            long duration = System.currentTimeMillis() - startTime;
            String requestPayload = serializeToJson(datos);
            auditLogService.logIntegrationFull("mod-ventas", "ACTUALIZAR_CLIENTE", url, 
                    "PATCH", responseStatus, duration, false, errorMessage, null,
                    requestPayload, null);
            throw new RuntimeException("Error al comunicarse con el servicio de clientes: " + e.getMessage(), e);
        }
    }

    /**
     * Serializa un objeto a JSON para logging.
     */
    private String serializeToJson(Object obj) {
        try {
            if (obj == null) return null;
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.debug("Error al serializar objeto a JSON: {}", e.getMessage());
            return obj.toString();
        }
    }
}
