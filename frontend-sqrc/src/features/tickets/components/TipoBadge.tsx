/**
 * Badge para mostrar el tipo de ticket
 */
import type { TipoTicket } from '../types';
import { TIPO_CONFIG } from '../types';

interface TipoBadgeProps {
  tipo: TipoTicket;
  size?: 'sm' | 'md';
}

export const TipoBadge = ({ tipo, size = 'sm' }: TipoBadgeProps) => {
  const config = TIPO_CONFIG[tipo];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};
