package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.RespuestaEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // 1. Importar esto
import org.springframework.stereotype.Repository;

@Repository
public interface RespuestaEncuestaRepository extends 
        JpaRepository<RespuestaEncuesta, Long>, 
        JpaSpecificationExecutor<RespuestaEncuesta> { // 2. ¡Agregar esta herencia!
        
    // Al agregar JpaSpecificationExecutor, automáticamente ganas acceso a:
    // findAll(Specification<T> spec)
    // count(Specification<T> spec)
    // etc.
}