package com.sqrc.module.backendsqrc.plantillaRespuesta.Repository;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface PlantillaRepository extends JpaRepository<Plantilla, Long> {

    // Muestra las plantillas que están activas (activo = 1/true)
    List<Plantilla> findByActivoTrueOrderByNombreAsc();

    // Búsqueda por nombre (para el buscador del administrador)
    // "ContainingIgnoreCase" hace un 'LIKE %texto%' insensible a mayúsculas
    List<Plantilla> findByNombreContainingIgnoreCase(String nombre);

    // Para evitar duplicados al crear/editar
    // Devuelve true si ya existe una plantilla con ese nombre
    boolean existsByNombre(String nombre);

    // Si necesitas buscar una específica por nombre exacto
    Optional<Plantilla> findByNombre(String nombre);

    // Busca plantillas activas de un tipo específico (ej: Solo RECLAMOS)
    List<Plantilla> findByTipoCasoAndActivoTrue(TipoCaso caso);
}