/**
 * Pestaña de Detalles del Ticket
 * Muestra información adicional del ticket (descripción, info específica por tipo)
 * La info del cliente se muestra en el layout principal
 */
import React from 'react';
import type { TicketDetail } from '../../types';

interface DetallesTabProps {
  ticket: TicketDetail;
}

export const DetallesTab: React.FC<DetallesTabProps> = ({ ticket }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Descripción del ticket */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Descripción del Ticket</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{ticket.descripcion}</p>
      </div>

      {/* Info específica por tipo */}
      {ticket.consultaInfo && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Tema de Consulta</h3>
          <p className="text-blue-600 text-sm">{ticket.consultaInfo.tema}</p>
        </div>
      )}

      {ticket.quejaInfo && (
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-6">
          <h3 className="text-sm font-semibold text-orange-700 mb-3">Información de Queja</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-32 text-sm text-orange-600">Impacto:</span>
              <span className="text-sm text-orange-700 font-medium">{ticket.quejaInfo.impacto}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-sm text-orange-600">Área involucrada:</span>
              <span className="text-sm text-orange-700 font-medium">{ticket.quejaInfo.areaInvolucrada}</span>
            </div>
          </div>
        </div>
      )}

      {ticket.reclamoInfo && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-6">
          <h3 className="text-sm font-semibold text-red-700 mb-3">Información de Reclamo</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-40 text-sm text-red-600">Motivo:</span>
              <span className="text-sm text-red-700 font-medium">{ticket.reclamoInfo.motivoReclamo}</span>
            </div>
            <div className="flex">
              <span className="w-40 text-sm text-red-600">Límite respuesta:</span>
              <span className="text-sm text-red-700 font-medium">
                {formatDate(ticket.reclamoInfo.fechaLimiteRespuesta)}
              </span>
            </div>
            <div className="flex">
              <span className="w-40 text-sm text-red-600">Límite resolución:</span>
              <span className="text-sm text-red-700 font-medium">
                {formatDate(ticket.reclamoInfo.fechaLimiteResolucion)}
              </span>
            </div>
            {ticket.reclamoInfo.resultado && (
              <div className="flex">
                <span className="w-40 text-sm text-red-600">Resultado:</span>
                <span className="text-sm text-red-700 font-medium">{ticket.reclamoInfo.resultado}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {ticket.solicitudInfo && (
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-6">
          <h3 className="text-sm font-semibold text-purple-700 mb-2">Tipo de Solicitud</h3>
          <p className="text-purple-600 text-sm">{ticket.solicitudInfo.tipoSolicitud}</p>
        </div>
      )}

      {/* Información adicional del ticket */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Ticket</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Fecha de creación:</span>
            <p className="text-sm text-gray-900 font-medium">
              {new Date(ticket.fechaCreacion).toLocaleString('es-PE')}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Origen:</span>
            <p className="text-sm text-gray-900 font-medium">
              {ticket.origen === 'LLAMADA' ? '📞 Llamada' : '🏢 Presencial'}
            </p>
          </div>
          {ticket.fechaCierre && (
            <div>
              <span className="text-sm text-gray-500">Fecha de cierre:</span>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(ticket.fechaCierre).toLocaleString('es-PE')}
              </p>
            </div>
          )}
          {ticket.idConstancia && (
            <div>
              <span className="text-sm text-gray-500">N° Constancia:</span>
              <p className="text-sm text-gray-900 font-medium">{ticket.idConstancia}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallesTab;
