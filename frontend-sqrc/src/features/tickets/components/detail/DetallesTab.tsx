/**
 * Pestaña de Detalles del Ticket
 * Muestra la descripción del ticket e información específica por tipo
 */
import React from 'react';
import type { TicketDetail } from '../../types';

interface DetallesTabProps {
  ticket: TicketDetail;
}

export const DetallesTab: React.FC<DetallesTabProps> = ({ ticket }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Información del Ticket */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Ticket</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm text-gray-500">Origen:</span>
            <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
              {ticket.origen === 'LLAMADA' ? (
                <>
                  <span className="text-pink-500">📞</span> Llamada
                </>
              ) : (
                <>
                  <span className="text-blue-500">🏢</span> Presencial
                </>
              )}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm text-gray-500">Fecha de creación:</span>
            <p className="text-gray-900 font-medium mt-1">
              {new Date(ticket.fechaCreacion).toLocaleString('es-PE')}
            </p>
          </div>
          {ticket.fechaCierre && (
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">Fecha de cierre:</span>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(ticket.fechaCierre).toLocaleString('es-PE')}
              </p>
            </div>
          )}
          {ticket.idConstancia && (
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm text-gray-500">N° Constancia:</span>
              <p className="text-blue-600 font-medium mt-1">{ticket.idConstancia}</p>
            </div>
          )}
        </div>
      </div>

      {/* Descripción del ticket */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Ticket</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {ticket.descripcion || 'Sin descripción'}
        </p>
      </div>

      {/* Motivo si existe */}
      {ticket.motivo && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Motivo</h3>
          <p className="text-gray-600">{ticket.motivo.descripcion}</p>
        </div>
      )}

      {/* Info específica por tipo */}
      {ticket.consultaInfo && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información de Consulta
          </h3>
          <div className="bg-white/50 rounded-lg p-4">
            <span className="text-sm text-blue-600 font-medium">Tema:</span>
            <p className="text-blue-900 mt-1">{ticket.consultaInfo.tema}</p>
          </div>
        </div>
      )}

      {ticket.quejaInfo && (
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Información de Queja
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-4">
              <span className="text-sm text-orange-600 font-medium">Impacto:</span>
              <p className="text-orange-900 mt-1">{ticket.quejaInfo.impacto}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <span className="text-sm text-orange-600 font-medium">Área involucrada:</span>
              <p className="text-orange-900 mt-1">{ticket.quejaInfo.areaInvolucrada}</p>
            </div>
          </div>
        </div>
      )}

      {ticket.reclamoInfo && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información de Reclamo
          </h3>
          <div className="space-y-3">
            <div className="bg-white/50 rounded-lg p-4">
              <span className="text-sm text-red-600 font-medium">Motivo del reclamo:</span>
              <p className="text-red-900 mt-1">{ticket.reclamoInfo.motivoReclamo}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-lg p-4">
                <span className="text-sm text-red-600 font-medium">Fecha límite respuesta:</span>
                <p className="text-red-900 mt-1 font-medium">
                  {formatDate(ticket.reclamoInfo.fechaLimiteRespuesta)}
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <span className="text-sm text-red-600 font-medium">Fecha límite resolución:</span>
                <p className="text-red-900 mt-1 font-medium">
                  {formatDate(ticket.reclamoInfo.fechaLimiteResolucion)}
                </p>
              </div>
            </div>
            {ticket.reclamoInfo.resultado && (
              <div className="bg-white/50 rounded-lg p-4">
                <span className="text-sm text-red-600 font-medium">Resultado:</span>
                <p className="text-red-900 mt-1">{ticket.reclamoInfo.resultado}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {ticket.solicitudInfo && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Información de Solicitud
          </h3>
          <div className="bg-white/50 rounded-lg p-4">
            <span className="text-sm text-purple-600 font-medium">Tipo de solicitud:</span>
            <p className="text-purple-900 mt-1">{ticket.solicitudInfo.tipoSolicitud}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallesTab;
