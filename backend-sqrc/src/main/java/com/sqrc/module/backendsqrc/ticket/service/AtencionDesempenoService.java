package com.sqrc.module.backendsqrc.ticket.service;

import com.sqrc.module.backendsqrc.ticket.dto.DesempenoAsignacionDTO;

import java.util.List;

/**
 * Servicio para obtener datos de desempeño de asignaciones.
 * Expone información agregada para ser consumida por otros módulos.
 */
public interface AtencionDesempenoService {

    /**
     * Obtiene el historial de desempeño de un empleado.
     * 
     * Proceso en 3 pasos:
     * 1. Identifica todas las asignaciones del empleado
     * 2. Recupera datos comunes del ticket (asunto, estado, categoría)
     * 3. Busca detalles específicos si el ticket es una Queja (nivel de impacto)
     *
     * @param empleadoId ID del empleado
     * @return Lista de DTOs con información de desempeño por asignación
     */
    List<DesempenoAsignacionDTO> getDesempenoPorEmpleado(Long empleadoId);
}
