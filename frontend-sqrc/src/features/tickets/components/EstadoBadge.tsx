/**
 * Badge para mostrar el estado del ticket según diseño
 * Estados con colores sólidos: verde, amarillo, naranja, rojo
 */
import type { EstadoTicket } from '../types';
import { ESTADO_CONFIG } from '../types';

interface EstadoBadgeProps {
  estado: EstadoTicket;
  size?: 'sm' | 'md';
}

export const EstadoBadge = ({ estado, size = 'sm' }: EstadoBadgeProps) => {
  const config = ESTADO_CONFIG[estado];
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};
