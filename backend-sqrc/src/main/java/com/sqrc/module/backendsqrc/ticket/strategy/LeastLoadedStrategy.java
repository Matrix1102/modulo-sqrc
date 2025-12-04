package com.sqrc.module.backendsqrc.ticket.strategy;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Estrategia de asignación basada en "Menor Carga".
 * Simulación: Selecciona aleatoriamente un agente de una lista predefinida.
 *
 * En un escenario real, consultaría la base de datos para encontrar
 * al agente con menos tickets asignados.
 */
@Component("leastLoaded")
public class LeastLoadedStrategy implements AssignmentStrategy {

    // Lista simulada de IDs de agentes disponibles
    private static final List<Long> AGENTES_DISPONIBLES = Arrays.asList(10L, 20L, 30L);
    private final Random random = new Random();

    /**
     * Simula la selección del agente con menos carga.
     *
     * @param areaDestino Área a la que se asigna el ticket
     * @return ID del agente seleccionado
     */
    @Override
    public Long findBestAgentId(String areaDestino) {
        System.out.println("🎯 [STRATEGY - Menos Carga] Ejecutando estrategia de asignación...");
        System.out.println("    → Área Destino: " + areaDestino);

        // Simulación: Seleccionar un agente al azar de la lista
        int index = random.nextInt(AGENTES_DISPONIBLES.size());
        Long agenteSeleccionado = AGENTES_DISPONIBLES.get(index);

        System.out.println("    → Agente Seleccionado (ID): " + agenteSeleccionado);

        return agenteSeleccionado;
    }
}

