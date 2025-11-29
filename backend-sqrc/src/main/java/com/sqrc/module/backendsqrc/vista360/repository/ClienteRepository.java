package com.sqrc.module.backendsqrc.vista360.repository;

import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para la entidad ClienteEntity.
 * Proporciona operaciones CRUD y consultas personalizadas sobre la tabla clientes.
 */
@Repository
public interface ClienteRepository extends JpaRepository<ClienteEntity, Integer> {

    /**
     * Busca un cliente por su DNI.
     *
     * @param dni Documento Nacional de Identidad del cliente
     * @return Optional conteniendo el cliente si existe
     */
    Optional<ClienteEntity> findByDni(String dni);

    /**
     * Verifica si existe un cliente con el DNI especificado.
     *
     * @param dni Documento Nacional de Identidad
     * @return true si existe, false en caso contrario
     */
    boolean existsByDni(String dni);

    /**
     * Busca clientes activos por ID.
     *
     * @param idCliente ID del cliente
     * @return Optional conteniendo el cliente si está activo
     */
    Optional<ClienteEntity> findByIdClienteAndActivoTrue(Integer idCliente);
}
