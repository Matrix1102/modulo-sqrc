package com.sqrc.module.backendsqrc.ticket.repository;

import com.sqrc.module.backendsqrc.ticket.model.Motivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MotivoRepository extends JpaRepository<Motivo, Long> {
    Optional<Motivo> findByNombre(String nombre);
}
