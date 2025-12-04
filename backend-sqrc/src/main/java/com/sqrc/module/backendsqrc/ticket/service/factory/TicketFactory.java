package com.sqrc.module.backendsqrc.ticket.service.factory;

import com.sqrc.module.backendsqrc.ticket.dto.request.CreateTicketRequest;
import com.sqrc.module.backendsqrc.ticket.model.*;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Factory para crear diferentes tipos de tickets.
 * 
 * Patrón: Factory Method
 * - Encapsula la lógica de creación de objetos
 * - Permite crear el subtipo correcto basado en TipoTicket
 * - Centraliza la configuración inicial de cada tipo
 */
@Component
public class TicketFactory {

    /**
     * Crea un ticket del tipo especificado con sus campos específicos.
     * 
     * @param request DTO con los datos del ticket
     * @param cliente Entidad cliente asociada
     * @param motivo Entidad motivo asociada (puede ser null)
     * @return Ticket del subtipo correspondiente
     */
    public Ticket crearTicket(CreateTicketRequest request, ClienteEntity cliente, Motivo motivo) {
        switch (request.getTipoTicket()) {
            case CONSULTA:
                return crearConsulta(request, cliente, motivo);
            case QUEJA:
                return crearQueja(request, cliente, motivo);
            case RECLAMO:
                return crearReclamo(request, cliente, motivo);
            case SOLICITUD:
                return crearSolicitud(request, cliente, motivo);
            default:
                throw new IllegalArgumentException("Tipo de ticket no soportado: " + request.getTipoTicket());
        }
    }

    /**
     * Crea una Consulta
     */
    private Consulta crearConsulta(CreateTicketRequest request, ClienteEntity cliente, Motivo motivo) {
        Consulta consulta = new Consulta();
        configurarCamposBase(consulta, request, cliente, motivo);
        
        // Campo específico de Consulta
        consulta.setTema(request.getTema());
        
        return consulta;
    }

    /**
     * Crea una Queja
     */
    private Queja crearQueja(CreateTicketRequest request, ClienteEntity cliente, Motivo motivo) {
        Queja queja = new Queja();
        configurarCamposBase(queja, request, cliente, motivo);
        
        // Campos específicos de Queja
        queja.setImpacto(request.getImpacto());
        queja.setAreaInvolucrada(request.getAreaInvolucrada());
        
        return queja;
    }

    /**
     * Crea un Reclamo
     */
    private Reclamo crearReclamo(CreateTicketRequest request, ClienteEntity cliente, Motivo motivo) {
        Reclamo reclamo = new Reclamo();
        configurarCamposBase(reclamo, request, cliente, motivo);
        
        // Campos específicos de Reclamo
        reclamo.setMotivoReclamo(request.getMotivoReclamo());
        
        // Calcular fechas límite según normativa (30 días para respuesta, 60 días para resolución)
        LocalDate hoy = LocalDate.now();
        reclamo.setFechaLimiteRespuesta(hoy.plusDays(30));
        reclamo.setFechaLimiteResolucion(hoy.plusDays(60));
        
        return reclamo;
    }

    /**
     * Crea una Solicitud
     */
    private Solicitud crearSolicitud(CreateTicketRequest request, ClienteEntity cliente, Motivo motivo) {
        Solicitud solicitud = new Solicitud();
        configurarCamposBase(solicitud, request, cliente, motivo);
        
        // Campo específico de Solicitud
        solicitud.setTipoSolicitud(request.getTipoSolicitud());
        
        return solicitud;
    }

    /**
     * Configura los campos comunes a todos los tipos de ticket.
     * 
     * Patrón: Template Method (parcial) - La configuración base es común
     */
    private void configurarCamposBase(Ticket ticket, CreateTicketRequest request, 
                                       ClienteEntity cliente, Motivo motivo) {
        ticket.setAsunto(request.getAsunto());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setOrigen(request.getOrigen());
        ticket.setCliente(cliente);
        ticket.setMotivo(motivo);
        ticket.setEstado(EstadoTicket.ABIERTO);
        ticket.setTipoTicket(request.getTipoTicket()); // Asignar explícitamente el tipo de ticket
        // fechaCreacion se establece automáticamente en @PrePersist
    }
}
