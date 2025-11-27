package com.sqrc.module.backendsqrc.reporte.repository;

import com.sqrc.module.backendsqrc.reporte.model.KpiTiemposResolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KpiTiemposResolucionRepository extends JpaRepository<KpiTiemposResolucion, Long> {

    // Trae los promedios calculados por día
    List<KpiTiemposResolucion> findByFechaBetween(LocalDate inicio, LocalDate fin);
}