/**
 * Badge para mostrar el tipo de ticket según diseño
 */
import type { TipoTicket } from '../types';
import { TIPO_CONFIG } from '../types';

interface TipoBadgeProps {
  tipo: TipoTicket;
  size?: 'sm' | 'md';
}

export const TipoBadge = ({ tipo, size = 'sm' }: TipoBadgeProps) => {
  const config = TIPO_CONFIG[tipo];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bgColor} ${config.color} ${config.borderColor} ${sizeClasses}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};
