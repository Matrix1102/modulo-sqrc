/**
 * Badge para mostrar el estado del ticket
 */
import type { EstadoTicket } from '../types';
import { ESTADO_CONFIG } from '../types';

interface EstadoBadgeProps {
  estado: EstadoTicket;
  size?: 'sm' | 'md';
}

export const EstadoBadge = ({ estado, size = 'sm' }: EstadoBadgeProps) => {
  const config = ESTADO_CONFIG[estado];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};
