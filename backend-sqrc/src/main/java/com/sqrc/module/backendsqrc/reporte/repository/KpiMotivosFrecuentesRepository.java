package com.sqrc.module.backendsqrc.reporte.repository;

import com.sqrc.module.backendsqrc.reporte.model.KpiMotivosFrecuentes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KpiMotivosFrecuentesRepository extends JpaRepository<KpiMotivosFrecuentes, Long> {

    // Trae el top de motivos día a día en el rango seleccionado
    List<KpiMotivosFrecuentes> findByFechaBetween(LocalDate inicio, LocalDate fin);
}