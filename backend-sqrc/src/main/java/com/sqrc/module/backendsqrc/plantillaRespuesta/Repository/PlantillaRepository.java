package com.sqrc.module.backendsqrc.plantillaRespuesta.Repository;

import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;


public interface PlantillaRepository extends JpaRepository<Plantilla, Long> {


    //muestra las plantillas que están activas (activo = 1/true)
    List<Plantilla> findByActivoTrueOrderByNombreAsc();

    // 2. Búsqueda por nombre (para el buscador del administrador)
    // "ContainingIgnoreCase" hace un 'LIKE %texto%' insensible a mayúsculas
    List<Plantilla> findByNombreInternoContainingIgnoreCase(String nombre);

    // 3. Para evitar duplicados al crear/editar
    // Devuelve true si ya existe una plantilla con ese nombre
    boolean existsByNombreInterno(String nombre);


    // Si necesitas buscar una específica por nombre exacto
    //Optional<Plantilla> findByNombreInterno(String nombre); //no veo necesario otro metodo asi

    // Busca plantillas activas de un tipo específico (ej: Solo RECLAMOS)
    List<Plantilla> findByCasoAndActivoTrue(TipoCaso caso);
}
