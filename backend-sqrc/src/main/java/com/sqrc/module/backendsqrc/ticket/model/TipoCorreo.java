package com.sqrc.module.backendsqrc.ticket.model;

public enum TipoCorreo {
    SOLICITUD_ESCALAMIENTO, // Agente pide escalar
    RESPUESTA_INTERNA,      // Backoffice responde/rechaza
    DERIVACION_EXTERNA      // Backoffice manda a TI
}
