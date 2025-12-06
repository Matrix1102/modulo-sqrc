package com.sqrc.module.backendsqrc.vista360.service;

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

    @Value("${api.clientes.url:https://mod-ventas.onrender.com/api/clientes/integracion/atencion-cliente}")
    private String apiBaseUrl;

    public ClienteApiClient() {
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

            log.info("Cliente obtenido exitosamente: {} {}", 
                    cliente != null ? cliente.getFirstName() : "null",
                    cliente != null ? cliente.getLastName() : "null");
            return cliente;

        } catch (ClienteNotFoundException e) {
            log.warn("Cliente no encontrado en API externa: {}", idCliente);
            throw e;
        } catch (Exception e) {
            log.error("Error al obtener cliente desde API externa: {}", e.getMessage());
            throw new RuntimeException("Error al comunicarse con el servicio de clientes: " + e.getMessage(), e);
        }
    }

    /**
     * Busca un cliente por su DNI en el API externo.
     * Endpoint: GET /api/clientes/integracion/atencion-cliente/buscar?dni={dni}
     *
     * @param dni DNI del cliente
     * @return ClienteExternoDTO con los datos del cliente
     * @throws ClienteNotFoundException si el cliente no existe
     */
    public ClienteExternoDTO obtenerClientePorDni(String dni) {
        String url = apiBaseUrl + "/buscar?dni=" + dni;
        log.info("GET {} - Buscando cliente por DNI desde API externa", url);

        try {
            ClienteExternoDTO cliente = webClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> {
                        if (response.statusCode().value() == 404) {
                            return Mono.error(new ClienteNotFoundException("Cliente con DNI " + dni + " no encontrado"));
                        }
                        return response.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new RuntimeException("Error del cliente: " + body)));
                    })
                    .bodyToMono(ClienteExternoDTO.class)
                    .block();

            log.info("Cliente encontrado por DNI {}: {} {}", 
                    dni,
                    cliente != null ? cliente.getFirstName() : "null",
                    cliente != null ? cliente.getLastName() : "null");
            return cliente;

        } catch (ClienteNotFoundException e) {
            log.warn("Cliente con DNI {} no encontrado en API externa", dni);
            throw e;
        } catch (Exception e) {
            log.error("Error al buscar cliente por DNI desde API externa: {}", e.getMessage());
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

            log.info("Cliente actualizado exitosamente: {}", idCliente);
            return clienteActualizado;

        } catch (ClienteNotFoundException e) {
            log.warn("Cliente no encontrado para actualizar: {}", idCliente);
            throw e;
        } catch (Exception e) {
            log.error("Error al actualizar cliente en API externa: {}", e.getMessage());
            throw new RuntimeException("Error al comunicarse con el servicio de clientes: " + e.getMessage(), e);
        }
    }
}
