package com.sqrc.module.backendsqrc.ticket.enums;

/**
 * Enum de Áreas Externas disponibles para derivación de tickets.
 * Equivalente a AREAS_EXTERNAS del frontend.
 */
public enum AreaExterna {
    TI(1L, "TI - Tecnología de la Información"),
    VENTAS(2L, "Ventas"),
    INFRAESTRUCTURA(3L, "Infraestructura");

    private final Long id;
    private final String nombre;

    AreaExterna(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    /**
     * Obtiene el nombre del área por su ID.
     * @param id ID del área
     * @return Nombre del área o "Área Desconocida" si no existe
     */
    public static String getNombreById(Long id) {
        if (id == null) {
            return "Área Desconocida";
        }
        for (AreaExterna area : values()) {
            if (area.getId().equals(id)) {
                return area.getNombre();
            }
        }
        return "Área " + id;
    }

    /**
     * Obtiene el área por su ID.
     * @param id ID del área
     * @return AreaExterna o null si no existe
     */
    public static AreaExterna getById(Long id) {
        if (id == null) {
            return null;
        }
        for (AreaExterna area : values()) {
            if (area.getId().equals(id)) {
                return area;
            }
        }
        return null;
    }
}
