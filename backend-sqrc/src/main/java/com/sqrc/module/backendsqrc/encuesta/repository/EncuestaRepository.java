package com.sqrc.module.backendsqrc.encuesta.repository;

import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {
}