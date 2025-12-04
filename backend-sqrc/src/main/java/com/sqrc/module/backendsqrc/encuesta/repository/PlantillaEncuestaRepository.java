package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.PlantillaEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlantillaEncuestaRepository extends JpaRepository<PlantillaEncuesta, Long> {
    
    /**
     * Busca la primera plantilla vigente.
     * Usado para asignar automáticamente una plantilla al crear encuestas.
     */
    Optional<PlantillaEncuesta> findFirstByVigenteTrue();
    
    // Puedes agregar métodos extra si necesitas, ej: findByNombre(String nombre);
}