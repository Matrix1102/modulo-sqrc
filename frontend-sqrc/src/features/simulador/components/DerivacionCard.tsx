/**
 * DerivacionCard - Tarjeta de ticket derivado para el simulador
 * 
 * Muestra información del ticket y notificación externa con opción de responder
 */

import { useState } from 'react';
import { Calendar, Building2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TicketDerivadoSimuladorDTO } from '../types';
import { AREAS_MAP } from '../types';
import ResponderDerivacionModal from './ResponderDerivacionModal';

interface DerivacionCardProps {
  ticket: TicketDerivadoSimuladorDTO;
  onRespuestaRegistrada: () => void;
}

export default function DerivacionCard({ ticket, onRespuestaRegistrada }: DerivacionCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Validación defensiva para evitar errores si notificacion es null
  if (!ticket.notificacion) {
    // Ticket sin derivación - no se renderiza
    return null;
  }

  const yaRespondido = !!ticket.notificacion.respuesta;
  const areaNombre = AREAS_MAP[ticket.notificacion.areaDestinoId] || `Área #${ticket.notificacion.areaDestinoId}`;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500">
                  TICKET #{ticket.idTicket}
                </span>
                {yaRespondido && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Ya Respondido
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                {ticket.asunto}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {ticket.descripcion}
              </p>
            </div>

            {!yaRespondido && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Responder
              </button>
            )}
          </div>
        </div>

        {/* Body - Notificación */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {areaNombre}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="w-3 h-3" />
                {ticket.notificacion.destinatarioEmail || 'Sin email'}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                {ticket.notificacion.fechaEnvio 
                  ? new Date(ticket.notificacion.fechaEnvio).toLocaleString('es-PE')
                  : 'Sin fecha'}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {ticket.notificacion.asunto || 'Sin asunto'}
            </p>
            <div
              className={`text-sm text-gray-600 whitespace-pre-wrap ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {ticket.notificacion.cuerpo || 'Sin contenido'}
            </div>
            {ticket.notificacion.cuerpo && ticket.notificacion.cuerpo.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        </div>

        {/* Footer - Respuesta si existe */}
        {yaRespondido && ticket.notificacion.respuesta && (
          <div className="p-4 border-t border-gray-100 bg-green-50">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-700 mb-1">
                  Respuesta registrada el{' '}
                  {ticket.notificacion.fechaRespuesta
                    ? new Date(ticket.notificacion.fechaRespuesta).toLocaleString('es-PE')
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-2">
                  {ticket.notificacion.respuesta}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert si no respondido */}
        {!yaRespondido && (
          <div className="p-3 border-t border-gray-100 bg-amber-50">
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">
                Pendiente de respuesta - Este ticket requiere tu atención
              </span>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <ResponderDerivacionModal
          ticket={ticket}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            onRespuestaRegistrada();
          }}
        />
      )}
    </>
  );
}

