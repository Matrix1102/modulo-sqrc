package com.sqrc.module.backendsqrc.reporte.repository;

import com.sqrc.module.backendsqrc.reporte.model.KpiResumenDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KpiResumenDiarioRepository extends JpaRepository<KpiResumenDiario, Long> {
    
    // Este es el método MÁGICO que usará tu Dashboard para ser ultra rápido.
    // Trae los datos pre-calculados de un rango de fechas.
    List<KpiResumenDiario> findByFechaBetween(LocalDate inicio, LocalDate fin);
}