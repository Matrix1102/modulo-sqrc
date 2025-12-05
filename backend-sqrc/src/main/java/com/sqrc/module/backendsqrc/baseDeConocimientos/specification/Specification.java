package com.sqrc.module.backendsqrc.baseDeConocimientos.specification;

/**
 * Specification Pattern - Interfaz base genérica para especificaciones.
 * 
 * <p>
 * El patrón Specification permite encapsular reglas de negocio en objetos
 * reutilizables que pueden combinarse de forma flexible.
 * </p>
 * 
 * <p>
 * <b>Uso principal:</b>
 * </p>
 * <ul>
 * <li>Filtrado y búsqueda de entidades</li>
 * <li>Validación de reglas de negocio</li>
 * <li>Selección de objetos según criterios</li>
 * </ul>
 * 
 * <p>
 * <b>Operaciones de composición:</b>
 * </p>
 * <ul>
 * <li>{@link #and(Specification)} - Combina con AND</li>
 * <li>{@link #or(Specification)} - Combina con OR</li>
 * <li>{@link #not()} - Niega la especificación</li>
 * </ul>
 * 
 * @param <T> Tipo de entidad que evalúa la especificación
 */
@FunctionalInterface
public interface Specification<T> {

    /**
     * Evalúa si el candidato satisface esta especificación.
     * 
     * @param candidate El objeto a evaluar
     * @return true si cumple la especificación, false en caso contrario
     */
    boolean isSatisfiedBy(T candidate);

    /**
     * Combina esta especificación con otra usando AND.
     * 
     * @param other La otra especificación
     * @return Nueva especificación que satisface ambas
     */
    default Specification<T> and(Specification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) && other.isSatisfiedBy(candidate);
    }

    /**
     * Combina esta especificación con otra usando OR.
     * 
     * @param other La otra especificación
     * @return Nueva especificación que satisface al menos una
     */
    default Specification<T> or(Specification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) || other.isSatisfiedBy(candidate);
    }

    /**
     * Niega esta especificación.
     * 
     * @return Nueva especificación que satisface lo contrario
     */
    default Specification<T> not() {
        return candidate -> !this.isSatisfiedBy(candidate);
    }

    /**
     * Crea una especificación que siempre es verdadera.
     */
    static <T> Specification<T> alwaysTrue() {
        return candidate -> true;
    }

    /**
     * Crea una especificación que siempre es falsa.
     */
    static <T> Specification<T> alwaysFalse() {
        return candidate -> false;
    }
}
