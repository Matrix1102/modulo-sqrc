package com.sqrc.module.backendsqrc.config;

import com.sqrc.module.backendsqrc.encuesta.model.AlcanceEvaluacion;
import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import com.sqrc.module.backendsqrc.encuesta.model.EstadoEncuesta;
import com.sqrc.module.backendsqrc.encuesta.model.PlantillaEncuesta;
import com.sqrc.module.backendsqrc.encuesta.repository.EncuestaRepository;
import com.sqrc.module.backendsqrc.encuesta.repository.PlantillaEncuestaRepository;
import com.sqrc.module.backendsqrc.vista360.model.ClienteEntity;
import com.sqrc.module.backendsqrc.vista360.repository.ClienteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PlantillaEncuestaRepository plantillaRepo;
    private final EncuestaRepository encuestaRepo;
    private final ClienteRepository clienteRepo;

    public DataInitializer(PlantillaEncuestaRepository plantillaRepo, EncuestaRepository encuestaRepo, ClienteRepository clienteRepo) {
        this.plantillaRepo = plantillaRepo;
        this.encuestaRepo = encuestaRepo;
        this.clienteRepo = clienteRepo;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Solo insertar si no hay encuestas en la BD
        if (encuestaRepo.count() == 0) {
            PlantillaEncuesta plantilla = new PlantillaEncuesta();
            plantilla.setNombre("Plantilla de ejemplo");
            plantilla.setDescripcion("Plantilla creada automáticamente para pruebas");
            plantilla.setVigente(true);
            plantilla.setAlcanceEvaluacion(AlcanceEvaluacion.SERVICIO);
            plantilla = plantillaRepo.save(plantilla);

            // Buscar un cliente existente para la encuesta de ejemplo
            Optional<ClienteEntity> clienteOpt = clienteRepo.findAll().stream().findFirst();
            
            Encuesta encuesta = new Encuesta();
            encuesta.setPlantilla(plantilla);
            encuesta.setEstadoEncuesta(EstadoEncuesta.ENVIADA);
            encuesta.setAlcanceEvaluacion(AlcanceEvaluacion.SERVICIO);
            // Solo asignar cliente si existe uno en la BD
            clienteOpt.ifPresent(encuesta::setCliente);
            
            encuesta = encuestaRepo.save(encuesta);

            System.out.println("[DataInitializer] Insertada encuesta de ejemplo id=" + encuesta.getIdEncuesta());
        }
    }
}
