package com.sqrc.module.backendsqrc.ticket.dto.response;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import com.sqrc.module.backendsqrc.ticket.model.OrigenTicket;
import com.sqrc.module.backendsqrc.ticket.model.TipoTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO con detalle completo de un ticket incluyendo info completa del cliente.
 * Para ser usado en la vista de detalle del ticket.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketFullDetailDTO {

    private Long idTicket;
    private String asunto;
    private String descripcion;
    private EstadoTicket estado;
    private TipoTicket tipoTicket;
    private OrigenTicket origen;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCierre;
    private Integer idConstancia;
    
    // Información completa del cliente
    private ClienteFullDTO cliente;
    
    // Motivo del ticket
    private MotivoDTO motivo;
    
    // Información de llamada asociada (si existe)
    private LlamadaDTO llamada;
    
    // Información específica por tipo
    private ConsultaInfoDTO consultaInfo;
    private QuejaInfoDTO quejaInfo;
    private ReclamoInfoDTO reclamoInfo;
    private SolicitudInfoDTO solicitudInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteFullDTO {
        private Integer idCliente;
        private String dni;
        private String nombre;
        private String apellido;
        private LocalDate fechaNacimiento;
        private String correo;
        private String telefono;
        private String celular;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MotivoDTO {
        private Long idMotivo;
        private String descripcion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LlamadaDTO {
        private Long idLlamada;
        private String numeroOrigen;
        private Integer duracionSegundos;
        private String duracionFormateada;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsultaInfoDTO {
        private String tema;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuejaInfoDTO {
        private String impacto;
        private String areaInvolucrada;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReclamoInfoDTO {
        private String motivoReclamo;
        private LocalDate fechaLimiteRespuesta;
        private LocalDate fechaLimiteResolucion;
        private String resultado;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolicitudInfoDTO {
        private String tipoSolicitud;
    }
}
