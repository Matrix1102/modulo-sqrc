package com.sqrc.module.backendsqrc.ticket.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final JdbcTemplate jdbc;

    public DebugController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/employees/backoffice/missing")
    public List<Map<String,Object>> empleadosConTipoBackofficeSinFilaBackoffice() {
        String sql = "SELECT e.id_empleado AS id, e.nombre, e.apellido, e.tipo_empleado "
                + "FROM empleados e LEFT JOIN backoffice b ON e.id_empleado = b.id_empleado "
                + "WHERE e.tipo_empleado = 'BACKOFFICE' AND b.id_empleado IS NULL";
        return jdbc.queryForList(sql);
    }

    @GetMapping("/employees/conflicts")
    public List<Map<String,Object>> empleadosConConflictoSubtipos() {
        String sql = "SELECT e.id_empleado AS id, e.tipo_empleado, "
                + "CASE WHEN a.id_empleado IS NOT NULL THEN 1 ELSE 0 END AS in_agentes, "
                + "CASE WHEN b.id_empleado IS NOT NULL THEN 1 ELSE 0 END AS in_backoffice "
                + "FROM empleados e "
                + "LEFT JOIN agentes a ON e.id_empleado = a.id_empleado "
                + "LEFT JOIN backoffice b ON e.id_empleado = b.id_empleado "
                + "WHERE (a.id_empleado IS NOT NULL AND b.id_empleado IS NOT NULL) "
                + "OR (e.tipo_empleado = 'BACKOFFICE' AND b.id_empleado IS NULL)";
        return jdbc.queryForList(sql);
    }
}
