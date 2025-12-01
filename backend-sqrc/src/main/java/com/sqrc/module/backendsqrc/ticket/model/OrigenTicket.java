package com.sqrc.module.backendsqrc.ticket.model;

public enum OrigenTicket {
    WEB("Web"),
    EMAIL("Email"),
    TELEFONO("Telefono"),
    CHAT("Chat"),
    API("API"),
    INTERNO("Interno"),
    APP("App"),
    OTRO("Otro");

    private final String displayName;

    OrigenTicket(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
