package com.sqrc.module.backendsqrc.config;

import com.sqrc.module.backendsqrc.encuesta.model.Encuesta;
import com.sqrc.module.backendsqrc.encuesta.model.EstadoEncuesta;
import com.sqrc.module.backendsqrc.encuesta.model.PlantillaEncuesta;
import com.sqrc.module.backendsqrc.encuesta.repository.EncuestaRepository;
import com.sqrc.module.backendsqrc.encuesta.repository.PlantillaEncuestaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PlantillaEncuestaRepository plantillaRepo;
    private final EncuestaRepository encuestaRepo;

    public DataInitializer(PlantillaEncuestaRepository plantillaRepo, EncuestaRepository encuestaRepo) {
        this.plantillaRepo = plantillaRepo;
        this.encuestaRepo = encuestaRepo;
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
            plantilla = plantillaRepo.save(plantilla);

            Encuesta encuesta = new Encuesta();
            encuesta.setPlantilla(plantilla);
            encuesta.setEstadoEncuesta(EstadoEncuesta.ENVIADA);
            encuesta = encuestaRepo.save(encuesta);

            System.out.println("[DataInitializer] Insertada encuesta de ejemplo id=" + encuesta.getIdEncuesta());
        }
    }
}
