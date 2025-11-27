package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.PlantillaEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantillaEncuestaRepository extends JpaRepository<PlantillaEncuesta, Long> {
    // Puedes agregar métodos extra si necesitas, ej: findByNombre(String nombre);
}