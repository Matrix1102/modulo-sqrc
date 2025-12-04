package com.sqrc.module.backendsqrc.vista360.service;

import com.sqrc.module.backendsqrc.encuesta.repository.EncuestaRepository;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;
import com.sqrc.module.backendsqrc.ticket.repository.TicketRepository;
import com.sqrc.module.backendsqrc.vista360.dto.ClienteBasicoDTO;
import com.sqrc.module.backendsqrc.vista360.dto.MetricaKPI_DTO;
import com.sqrc.module.backendsqrc.vista360.exception.ClienteNotFoundException;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import com.sqrc.module.backendsqrc.vista360.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Servicio de aplicación para gestionar la Vista 360 del cliente.
 * Proporciona operaciones de consulta y actualización de información básica del
 * cliente,
 * así como el cálculo de métricas KPI basadas en datos reales.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class Vista360Service {

        private final ClienteRepository clienteRepository;
        private final TicketRepository ticketRepository;

        private final EncuestaRepository encuestaRepository;

        // Estados que se consideran "abiertos" (no resueltos)
        private static final Set<EstadoTicket> ESTADOS_ABIERTOS = Set.of(
                        EstadoTicket.ABIERTO,
                        EstadoTicket.ESCALADO,
                        EstadoTicket.DERIVADO);

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
         * Actualiza la información del cliente (todos los campos excepto idCliente).
         * Implementa operación PATCH para actualización completa.
         *
         * @param id    ID del cliente a actualizar
         * @param datos DTO con los datos actualizados
         * @return DTO con la información actualizada del cliente
         * @throws ClienteNotFoundException si el cliente no existe
         */
        @Transactional
        public ClienteBasicoDTO actualizarInformacionCliente(Integer id,
                        com.sqrc.module.backendsqrc.vista360.dto.ActualizarClienteDTO datos) {
                log.debug("Actualizando información del cliente ID: {}", id);

                ClienteEntity cliente = clienteRepository.findById(id)
                                .orElseThrow(() -> new ClienteNotFoundException(id));

                // Actualizar datos personales
                if (datos.getDni() != null && !datos.getDni().isBlank()) {
                        cliente.setDni(datos.getDni());
                }
                if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                        cliente.setNombres(datos.getNombre());
                }
                if (datos.getApellido() != null && !datos.getApellido().isBlank()) {
                        cliente.setApellidos(datos.getApellido());
                }
                if (datos.getFechaNacimiento() != null) {
                        cliente.setFechaNacimiento(datos.getFechaNacimiento());
                }

                // Actualizar datos de contacto
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
                log.info("Información del cliente actualizada para ID: {}", id);

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
                                .nombre(cliente.getNombres())
                                .apellido(cliente.getApellidos())
                                .fechaNacimiento(cliente.getFechaNacimiento())
                                .correo(cliente.getCorreo())
                                .telefono(cliente.getTelefono())
                                .celular(cliente.getCelular())
                                .build();
        }

        /**
         * Calcula la métrica de Tiempo Promedio de Solución.
         * Basado en todos los tickets cerrados del cliente.
         */
        private MetricaKPI_DTO calcularTiempoPromedioSolucion(Integer idCliente) {
                List<Ticket> ticketsCliente = ticketRepository.findByClienteIdCliente(idCliente);

                // Filtrar todos los tickets cerrados (fechaCierre no nula)
                List<Ticket> ticketsCerrados = ticketsCliente.stream()
                                .filter(t -> t.getFechaCierre() != null)
                                .toList();

                // Calcular promedio global
                double tiempoPromedioHoras = calcularPromedioResolucionHoras(ticketsCerrados);

                // Formatear el valor
                String valorPrincipal;
                String unidad;

                if (tiempoPromedioHoras > 0) {
                        if (tiempoPromedioHoras < 1) {
                                // Si es menos de 1 hora, mostrar en minutos
                                double minutos = tiempoPromedioHoras * 60;
                                valorPrincipal = String.format("%.0f", minutos);
                                unidad = "min";
                        } else if (tiempoPromedioHoras > 24) {
                                // Si es más de 24 horas, mostrar en días
                                double dias = tiempoPromedioHoras / 24;
                                valorPrincipal = String.format("%.1f", dias);
                                unidad = "días";
                        } else {
                                // Mostrar en horas
                                valorPrincipal = String.format("%.1f", tiempoPromedioHoras);
                                unidad = "hrs";
                        }
                } else {
                        valorPrincipal = "N/A";
                        unidad = "";
                }

                // Para la tendencia, podríamos comparar con el mes anterior, pero el
                // requerimiento
                // pide específicamente el promedio global. Dejaremos la tendencia como
                // informativa
                // o neutra si no hay datos suficientes para comparar, o podríamos comparar
                // este promedio global con el promedio de tickets cerrados solo el mes pasado
                // para ver si estamos mejorando o empeorando.
                // Por simplicidad y siguiendo el requerimiento estricto de "devolver el
                // tiempo",
                // mostraremos "Promedio histórico" como subtítulo.

                String subtitulo = "Promedio histórico";
                MetricaKPI_DTO.EstadoTendencia tendencia = MetricaKPI_DTO.EstadoTendencia.NEUTRO;

                return MetricaKPI_DTO.builder()
                                .titulo("Tiempo Promedio de Solución")
                                .valorPrincipal(valorPrincipal)
                                .unidad(unidad)
                                .subtituloTendencia(subtitulo)
                                .estadoTendencia(tendencia)
                                .build();
        }

        /**
         * Calcula el promedio de horas de resolución de una lista de tickets.
         */
        private double calcularPromedioResolucionHoras(List<Ticket> tickets) {
                if (tickets.isEmpty()) {
                        return 0;
                }

                double totalHoras = tickets.stream()
                                .filter(t -> t.getFechaCreacion() != null && t.getFechaCierre() != null)
                                .mapToDouble(t -> {
                                        Duration duracion = Duration.between(t.getFechaCreacion(), t.getFechaCierre());
                                        return duracion.toMinutes() / 60.0;
                                })
                                .sum();

                long count = tickets.stream()
                                .filter(t -> t.getFechaCreacion() != null && t.getFechaCierre() != null)
                                .count();

                return count > 0 ? totalHoras / count : 0;
        }

        /**
         * Calcula la métrica de Tickets Abiertos actuales.
         * Cuenta tickets del cliente con estado ABIERTO, ESCALADO o DERIVADO.
         */
        private MetricaKPI_DTO calcularTicketsAbiertos(Integer idCliente) {
                List<Ticket> ticketsCliente = ticketRepository.findByClienteIdCliente(idCliente);

                // Contar tickets abiertos actuales
                long ticketsAbiertos = ticketsCliente.stream()
                                .filter(t -> ESTADOS_ABIERTOS.contains(t.getEstado()))
                                .count();

                // Calcular promedio histórico de tickets abiertos (aproximación)
                // Usamos el total de tickets cerrados para estimar un promedio
                long ticketsTotales = ticketsCliente.size();
                double promedioHistorico = ticketsTotales > 0 ? ticketsTotales * 0.2 : 2; // Estimación: 20% suelen
                                                                                          // estar abiertos

                long diferencia = (long) (ticketsAbiertos - promedioHistorico);

                // Menos tickets abiertos = mejor (positivo)
                MetricaKPI_DTO.EstadoTendencia tendencia = ticketsAbiertos <= 2
                                ? MetricaKPI_DTO.EstadoTendencia.POSITIVO
                                : ticketsAbiertos <= 5
                                                ? MetricaKPI_DTO.EstadoTendencia.NEUTRO
                                                : MetricaKPI_DTO.EstadoTendencia.NEGATIVO;

                return MetricaKPI_DTO.builder()
                                .titulo("Tickets Abiertos")
                                .valorPrincipal(String.valueOf(ticketsAbiertos))
                                .unidad(ticketsAbiertos == 1 ? "ticket" : "tickets")
                                .subtituloTendencia(String.format("%+d del promedio", diferencia))
                                .estadoTendencia(tendencia)
                                .build();
        }

        /**
         * Calcula la métrica de Calificación de la Atención.
         * Basado en el promedio de calificaciones de encuestas del cliente.
         */
        private MetricaKPI_DTO calcularCalificacionAtencion(Integer idCliente) {
                Double promedioCalificacion = encuestaRepository.findPromedioCalificacionByClienteId(idCliente);
                
                log.info("Calificación para cliente {}: {}", idCliente, promedioCalificacion);

                String valorPrincipal;
                String subtitulo;
                MetricaKPI_DTO.EstadoTendencia tendencia;

                if (promedioCalificacion != null && promedioCalificacion > 0) {
                        valorPrincipal = String.format("%.1f", promedioCalificacion);
                        subtitulo = "Promedio histórico";

                        // Determinar tendencia/estado basado en la calificación
                        if (promedioCalificacion >= 4.0) {
                                tendencia = MetricaKPI_DTO.EstadoTendencia.POSITIVO;
                        } else if (promedioCalificacion >= 3.0) {
                                tendencia = MetricaKPI_DTO.EstadoTendencia.NEUTRO;
                        } else {
                                tendencia = MetricaKPI_DTO.EstadoTendencia.NEGATIVO;
                        }
                } else {
                        valorPrincipal = "No evaluado";
                        subtitulo = "Sin encuestas";
                        tendencia = MetricaKPI_DTO.EstadoTendencia.NEUTRO;
                }

                return MetricaKPI_DTO.builder()
                                .titulo("Calificación de la Atención")
                                .valorPrincipal(valorPrincipal)
                                .unidad(promedioCalificacion != null && promedioCalificacion > 0 ? "/5" : "")
                                .subtituloTendencia(subtitulo)
                                .estadoTendencia(tendencia)
                                .build();
        }

        /**
         * Calcula la métrica de Tickets creados en el último mes.
         * Cuenta tickets del cliente creados en los últimos 30 días.
         */
        private MetricaKPI_DTO calcularTicketsUltimoMes(Integer idCliente) {
                LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);
                LocalDateTime hace60Dias = LocalDateTime.now().minusDays(60);

                List<Ticket> ticketsCliente = ticketRepository.findByClienteIdCliente(idCliente);

                // Contar tickets del mes actual
                long ticketsMesActual = ticketsCliente.stream()
                                .filter(t -> t.getFechaCreacion() != null && t.getFechaCreacion().isAfter(hace30Dias))
                                .count();

                // Contar tickets del mes anterior
                long ticketsMesAnterior = ticketsCliente.stream()
                                .filter(t -> t.getFechaCreacion() != null
                                                && t.getFechaCreacion().isAfter(hace60Dias)
                                                && t.getFechaCreacion().isBefore(hace30Dias))
                                .count();

                // Calcular variación porcentual
                double variacionPorcentaje = 0;
                if (ticketsMesAnterior > 0) {
                        variacionPorcentaje = ((double) (ticketsMesActual - ticketsMesAnterior) / ticketsMesAnterior)
                                        * 100;
                }

                // Menos tickets = mejor (positivo), más tickets = peor (negativo)
                MetricaKPI_DTO.EstadoTendencia tendencia = variacionPorcentaje < -10
                                ? MetricaKPI_DTO.EstadoTendencia.POSITIVO
                                : variacionPorcentaje > 10
                                                ? MetricaKPI_DTO.EstadoTendencia.NEGATIVO
                                                : MetricaKPI_DTO.EstadoTendencia.NEUTRO;

                String subtitulo = ticketsMesAnterior > 0
                                ? String.format("%+.0f%% vs mes anterior", variacionPorcentaje)
                                : "Primer registro";

                return MetricaKPI_DTO.builder()
                                .titulo("Tickets del Último Mes")
                                .valorPrincipal(String.valueOf(ticketsMesActual))
                                .unidad(ticketsMesActual == 1 ? "ticket" : "tickets")
                                .subtituloTendencia(subtitulo)
                                .estadoTendencia(tendencia)
                                .build();
        }
}
