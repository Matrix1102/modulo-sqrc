package com.sqrc.module.backendsqrc.reporte.repository;

import com.sqrc.module.backendsqrc.reporte.model.KpiRendimientoAgenteDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KpiRendimientoAgenteDiarioRepository extends JpaRepository<KpiRendimientoAgenteDiario, Long> {

    // Recupera el rendimiento de todos los agentes en un rango de fechas
    List<KpiRendimientoAgenteDiario> findByFechaBetween(LocalDate inicio, LocalDate fin);

    // Con JOIN FETCH para cargar el agente (evita N+1 queries)
    @Query("SELECT k FROM KpiRendimientoAgenteDiario k JOIN FETCH k.agente WHERE k.fecha BETWEEN :inicio AND :fin")
    List<KpiRendimientoAgenteDiario> findByFechaBetweenWithAgente(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    // Opcional: Si quieres ver la evolución de UN solo agente (para la vista de detalle)
    // Usa 'agente.idEmpleado' ya que Agente hereda de Empleado y su PK es idEmpleado
    List<KpiRendimientoAgenteDiario> findByAgente_IdEmpleadoAndFechaBetween(Long agenteId, LocalDate inicio, LocalDate fin);
}