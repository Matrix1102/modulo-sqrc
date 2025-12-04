package com.sqrc.module.backendsqrc.ticket.dto.response;

import com.sqrc.module.backendsqrc.ticket.model.EstadoTicket;
import com.sqrc.module.backendsqrc.ticket.model.OrigenTicket;
import com.sqrc.module.backendsqrc.ticket.model.TipoTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para la lista de tickets.
 * Evita problemas de serialización con proxies de Hibernate.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketListItemDTO {

    private Long idTicket;
    private String asunto;
    private EstadoTicket estado;
    private TipoTicket tipoTicket;
    private OrigenTicket origen;
    private LocalDateTime fechaCreacion;
    private ClienteInfoDTO cliente;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteInfoDTO {
        private Integer idCliente;
        private String nombre;
        private String apellido;
    }
}
