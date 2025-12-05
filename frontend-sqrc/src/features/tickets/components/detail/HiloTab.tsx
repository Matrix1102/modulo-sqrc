/**
 * Pestaña de Hilo del Ticket
 * Muestra el historial de correos y comunicaciones del ticket
 */
import React from 'react';
import { useCorreos } from '../../hooks/useCorreos';
import type { TipoCorreo } from '../../types';

interface HiloTabProps {
  ticketId: number;
}

export const HiloTab: React.FC<HiloTabProps> = ({ ticketId }) => {
  const { correos, loading, error } = useCorreos(ticketId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar el historial</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (correos.length === 0) {
    return (
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin comunicaciones aún</h3>
          <p className="text-gray-500">
            No hay correos registrados para este ticket.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Los correos de escalamiento y derivación aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Comunicaciones
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {correos.length} {correos.length === 1 ? 'correo' : 'correos'} registrados
        </p>
      </div>

      <div className="space-y-4">
        {correos.map((correo) => (
          <CorreoCard key={correo.idCorreo} correo={correo} />
        ))}
      </div>
    </div>
  );
};

// Componente para renderizar cada correo
interface CorreoCardProps {
  correo: {
    idCorreo: number;
    asunto: string;
    cuerpo: string;
    fechaEnvio: string;
    tipoCorreo: TipoCorreo;
    empleadoNombre: string;
    empleadoCorreo: string;
    empleadoArea: string;
  };
}

const CorreoCard: React.FC<CorreoCardProps> = ({ correo }) => {
  const [expanded, setExpanded] = React.useState(false);

  const getTipoCorreoConfig = (tipo: TipoCorreo) => {
    switch (tipo) {
      case 'SOLICITUD_ESCALAMIENTO':
        return {
          icon: '⚠️',
          label: 'Escalamiento',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          badgeColor: 'bg-orange-100 text-orange-800',
        };
      case 'DERIVACION_EXTERNA':
        return {
          icon: '📤',
          label: 'Derivación Externa',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-700',
          badgeColor: 'bg-purple-100 text-purple-800',
        };
      case 'RESPUESTA_INTERNA':
        return {
          icon: '💬',
          label: 'Respuesta Interna',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      default:
        return {
          icon: '📧',
          label: 'Correo',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getTipoCorreoConfig(correo.tipoCorreo);
  const fechaFormateada = new Date(correo.fechaEnvio).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg overflow-hidden transition-all duration-200`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.badgeColor}`}>
                {config.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-sm font-medium ${config.textColor} hover:underline flex items-center gap-1`}
          >
            {expanded ? 'Contraer' : 'Ver detalles'}
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <h4 className={`text-base font-semibold ${config.textColor} mb-2`}>
          {correo.asunto}
        </h4>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">{correo.empleadoNombre}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{correo.empleadoArea}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-500">{correo.empleadoCorreo}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-500">{fechaFormateada}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo expandible */}
      {expanded && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: correo.cuerpo }}
          />
        </div>
      )}
    </div>
  );
};

export default HiloTab;

