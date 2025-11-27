package com.sqrc.module.backendsqrc.plantillaRespuesta.Service;


import com.sqrc.module.backendsqrc.plantillaRespuesta.Repository.PlantillaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.TipoCaso;
import lombok.RequiredArgsConstructor;
import com.sqrc.module.backendsqrc.plantillaRespuesta.model.Plantilla;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PlantillaService {


    private final PlantillaRepository plantillaRepository;

    public PlantillaService(PlantillaRepository plantillaRepository) {
        this.plantillaRepository = plantillaRepository;
    }

    @Transactional(readOnly = true)
    public List<Plantilla> listarTodas() {
        return plantillaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Plantilla> listarActivasPorCaso(TipoCaso caso) {
        // Si no especifican caso, devolvemos todas las activas ordenadas
        if (caso == null) {
            return plantillaRepository.findByActivoTrueOrderByNombreAsc();
        }
        // Si especifican caso (ej: RECLAMO), filtramos
        return plantillaRepository.findByTipoCasoAndActivoTrue(caso);
    }

    @Transactional(readOnly = true)
    public Plantilla obtenerPorId(Long id) {
        return plantillaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la plantilla con ID: " + id));
    }


    @Transactional
    public Plantilla crearPlantilla(Plantilla plantilla) {
        //verifica que no vea otro nombre igual
        if (plantillaRepository.existsByNombre(plantilla.getNombre())) {
            throw new RuntimeException("Ya existe una plantilla con el nombre interno: " + plantilla.getNombre());
        }


        plantilla.setActivo(true); //nace activa por defecto
        plantilla.setIdPlantilla(null); //forzamos que sea un INSERT, no un update accidental. en la misma bd le dan un id

        return plantillaRepository.save(plantilla);
    }

    @Transactional
    public Plantilla actualizarPlantilla(Long id, Plantilla datosNuevos) {
        //buscamos la plantilla original
        Plantilla plantillaDB = obtenerPorId(id);

        //validamos el nombre
        // Solo lanzamos error si CAMBIÓ el nombre Y el nuevo nombre ya existe en OTRA plantilla
        if (!plantillaDB.getNombre().equalsIgnoreCase(datosNuevos.getNombre())
                && plantillaRepository.existsByNombre(datosNuevos.getNombre())) {
            throw new RuntimeException("El nombre '" + datosNuevos.getNombre() + "' ya está en uso.");
        }

        //actualizamos SOLO los campos editables
        //no tocamos ID, ni fechaCreacion, ni activo
        plantillaDB.setNombre(datosNuevos.getNombre());
        plantillaDB.setTituloVisible(datosNuevos.getTituloVisible());
        plantillaDB.setTipoCaso(datosNuevos.getTipoCaso());
        plantillaDB.setHtmlModel(datosNuevos.getHtmlModel());
        plantillaDB.setCuerpo(datosNuevos.getCuerpo());
        plantillaDB.setDespedida(datosNuevos.getDespedida());
        plantillaDB.setFechaModificacion(LocalDateTime.now());


        return plantillaRepository.save(plantillaDB);
    }

    @Transactional
    public void desactivarPlantilla(Long id) {
        //borado logico
        Plantilla plantilla = obtenerPorId(id);
        plantilla.setActivo(false);
        plantillaRepository.save(plantilla);
    }

    @Transactional
    public void reactivarPlantilla(Long id) {

        Plantilla plantilla = obtenerPorId(id);
        plantilla.setActivo(true);
        plantillaRepository.save(plantilla);
    }
}
