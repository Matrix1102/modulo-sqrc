package com.sqrc.module.backendsqrc.reporte.repository;

import com.sqrc.module.backendsqrc.reporte.model.KpiRendimientoAgenteDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KpiRendimientoAgenteDiarioRepository extends JpaRepository<KpiRendimientoAgenteDiario, Long> {

    // Recupera el rendimiento de todos los agentes en un rango de fechas
    List<KpiRendimientoAgenteDiario> findByFechaBetween(LocalDate inicio, LocalDate fin);

    // Opcional: Si quieres ver la evolución de UN solo agente (para la vista de detalle)
    List<KpiRendimientoAgenteDiario> findByAgenteIdAndFechaBetween(Long agenteId, LocalDate inicio, LocalDate fin);
}