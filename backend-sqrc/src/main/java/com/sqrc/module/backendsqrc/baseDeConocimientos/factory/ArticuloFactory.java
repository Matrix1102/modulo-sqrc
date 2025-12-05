package com.sqrc.module.backendsqrc.baseDeConocimientos.factory;

import com.sqrc.module.backendsqrc.baseDeConocimientos.dto.ArticuloGeneradoIA;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.Articulo;
import com.sqrc.module.backendsqrc.baseDeConocimientos.model.ArticuloVersion;
import com.sqrc.module.backendsqrc.ticket.model.Empleado;
import com.sqrc.module.backendsqrc.ticket.model.Ticket;

/**
 * Factory Pattern - Interfaz base para la creación de artículos.
 * 
 * <p>
 * Define el contrato para la creación de artículos y sus versiones,
 * permitiendo encapsular la lógica de construcción y facilitar la
 * extensibilidad.
 * </p>
 * 
 * <p>
 * <b>Patrones utilizados:</b>
 * </p>
 * <ul>
 * <li><b>Factory Method:</b> Métodos para crear diferentes tipos de artículos
 * según el origen</li>
 * <li><b>Abstract Factory:</b> Combinación de creación de Articulo y
 * ArticuloVersion</li>
 * </ul>
 * 
 * @see ArticuloFactoryImpl
 * @see ArticuloCreationContext
 */
public interface ArticuloFactory {

    /**
     * Crea un artículo completo (artículo + versión inicial) usando el contexto
     * proporcionado.
     * 
     * @param context Contexto con todos los datos necesarios para la creación
     * @return El artículo creado con su versión inicial
     */
    Articulo crearArticulo(ArticuloCreationContext context);

    /**
     * Crea solo el objeto Articulo sin persistirlo.
     * Útil para casos donde se necesita modificar el artículo antes de guardar.
     * 
     * @param contenido Contenido generado por IA
     * @param creador   Empleado que crea el artículo
     * @return Articulo sin persistir
     */
    Articulo crearArticuloSinPersistir(ArticuloGeneradoIA contenido, Empleado creador);

    /**
     * Crea una nueva versión para un artículo existente.
     * 
     * @param articulo     Artículo padre
     * @param contenido    Contenido de la versión
     * @param creador      Empleado que crea la versión
     * @param notaCambio   Nota explicando el cambio
     * @param ticketOrigen Ticket de origen (puede ser null)
     * @return La nueva versión creada
     */
    ArticuloVersion crearVersion(Articulo articulo, String contenido,
            Empleado creador, String notaCambio, Ticket ticketOrigen);

    /**
     * Genera un código único para un nuevo artículo.
     * 
     * @return Código único en formato KB-IA-XXXXXXXX
     */
    String generarCodigoUnico();
}
