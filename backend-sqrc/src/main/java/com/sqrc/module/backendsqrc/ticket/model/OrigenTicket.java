package com.sqrc.module.backendsqrc.ticket.model;

public enum OrigenTicket {
    LLAMADA("Llamada"),
    PRESENCIAL("Presencial");

    private final String displayName;

    OrigenTicket(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
