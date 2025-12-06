/**
 * Pestaña de Detalles del Ticket
 * Muestra la descripción del ticket e información específica por tipo
 */
import React, { useState } from 'react';
import type { TicketDetail } from '../../types';
import { EscalarTicketModal } from '../EscalarTicketModal';
import { RechazarEscalamientoModal } from '../RechazarEscalamientoModal';
import { DerivarTicketModal } from '../DerivarTicketModal';
import { RespuestaExternaModal } from '../RespuestaExternaModal';

interface DetallesTabProps {
  ticket: TicketDetail;
  onRefresh?: () => void;
}

export const DetallesTab: React.FC<DetallesTabProps> = ({ ticket, onRefresh }) => {
  const [isEscalarModalOpen, setIsEscalarModalOpen] = useState(false);
  const [isRechazarEscalamientoModalOpen, setIsRechazarEscalamientoModalOpen] = useState(false);
  const [isDerivarModalOpen, setIsDerivarModalOpen] = useState(false);
  const [isRespuestaExternaModalOpen, setIsRespuestaExternaModalOpen] = useState(false);

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
      {/* Botón de Escalar (solo si el ticket está ABIERTO) */}
      {ticket.estado === 'ABIERTO' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">¿Necesitas ayuda de BackOffice?</h4>
                <p className="text-sm text-gray-600">Escala este ticket si requiere atención especializada</p>
              </div>
            </div>
            <button
              onClick={() => setIsEscalarModalOpen(true)}
              className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg text-sm font-semibold
                       hover:bg-yellow-600 active:bg-yellow-700 transition-colors
                       flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Escalar Ticket
            </button>
          </div>
        </div>
      )}

      {/* Botón de Rechazar Escalamiento (solo si el ticket está ESCALADO - para BackOffice) */}
      {ticket.estado === 'ESCALADO' && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">¿No puedes aceptar este escalamiento?</h4>
                <p className="text-sm text-gray-600">Devuelve el ticket al Agente con instrucciones específicas</p>
              </div>
            </div>
            <button
              onClick={() => setIsRechazarEscalamientoModalOpen(true)}
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold
                       hover:bg-red-600 active:bg-red-700 transition-colors
                       flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Rechazar Escalamiento
            </button>
          </div>
        </div>
      )}

      {/* Botón de Derivar (solo si el ticket está ABIERTO o ESCALADO) */}
      {(ticket.estado === 'ABIERTO' || ticket.estado === 'ESCALADO') && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">¿Requiere intervención externa?</h4>
                <p className="text-sm text-gray-600">Deriva este ticket a un área especializada externa</p>
              </div>
            </div>
            <button
              onClick={() => setIsDerivarModalOpen(true)}
              className="px-5 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-semibold
                       hover:bg-purple-600 active:bg-purple-700 transition-colors
                       flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Derivar a Externo
            </button>
          </div>
        </div>
      )}

      {/* Botón de Respuesta Externa (solo si el ticket está DERIVADO) */}
      {ticket.estado === 'DERIVADO' && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">¿Ya recibiste respuesta del área externa?</h4>
                <p className="text-sm text-gray-600">Registra la respuesta recibida para cerrar el ciclo</p>
              </div>
            </div>
            <button
              onClick={() => setIsRespuestaExternaModalOpen(true)}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold
                       hover:bg-blue-600 active:bg-blue-700 transition-colors
                       flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registrar Respuesta Externa
            </button>
          </div>
        </div>
      )}

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
          {ticket.llamada && (
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <span className="text-sm text-green-600 font-medium">Número de llamada:</span>
              <p className="text-green-900 font-bold mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {ticket.llamada.numeroOrigen}
              </p>
              {ticket.llamada.duracionFormateada && (
                <p className="text-xs text-green-600 mt-1">
                  Duración: {ticket.llamada.duracionFormateada}
                </p>
              )}
            </div>
          )}
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

      {/* Modal de Escalamiento */}
      <EscalarTicketModal
        isOpen={isEscalarModalOpen}
        onClose={() => setIsEscalarModalOpen(false)}
        ticketId={ticket.idTicket}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      {/* Modal de Rechazo de Escalamiento */}
      <RechazarEscalamientoModal
        isOpen={isRechazarEscalamientoModalOpen}
        onClose={() => setIsRechazarEscalamientoModalOpen(false)}
        ticketId={ticket.idTicket}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      {/* Modal de Derivación */}
      <DerivarTicketModal
        isOpen={isDerivarModalOpen}
        onClose={() => setIsDerivarModalOpen(false)}
        ticketId={ticket.idTicket}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      {/* Modal de Respuesta Externa */}
      <RespuestaExternaModal
        isOpen={isRespuestaExternaModalOpen}
        onClose={() => setIsRespuestaExternaModalOpen(false)}
        ticketId={ticket.idTicket}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default DetallesTab;
