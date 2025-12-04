/**
 * Página de detalle del ticket
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EstadoBadge } from '../components/EstadoBadge';
import { TipoBadge } from '../components/TipoBadge';
import { getTicketById, getDocumentacion, getAsignaciones } from '../services/ticketApi';
import type { TicketDetail, DocumentacionDTO, AsignacionDTO } from '../types';

type TabType = 'detalles' | 'documentacion' | 'hilo';

export const TicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [documentacion, setDocumentacion] = useState<DocumentacionDTO[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('detalles');

  useEffect(() => {
    if (ticketId) {
      loadTicketData(parseInt(ticketId));
    }
  }, [ticketId]);

  const loadTicketData = async (id: number) => {
    setLoading(true);
    setError('');

    try {
      const [ticketData, docs, asigns] = await Promise.all([
        getTicketById(id),
        getDocumentacion(id).catch(() => []),
        getAsignaciones(id).catch(() => []),
      ]);

      setTicket(ticketData);
      setDocumentacion(docs);
      setAsignaciones(asigns);
    } catch {
      setError('Error al cargar los datos del ticket');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTicketId = (id: number) => {
    return `#TC-${id.toString().padStart(4, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando ticket...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Ticket no encontrado'}</p>
        <button
          onClick={() => navigate('/agente/tickets')}
          className="text-blue-600 hover:underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/agente/tickets')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {ticket.asunto}
              <span className="text-gray-400 font-normal text-lg">
                {formatTicketId(ticket.idTicket)}
              </span>
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('detalles')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'detalles'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('documentacion')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'documentacion'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documentación
          </button>
          <button
            onClick={() => setActiveTab('hilo')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'hilo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Hilo
          </button>
        </div>
      </div>

      {/* Estado y Tipo */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">ESTADO:</span>
          <EstadoBadge estado={ticket.estado} size="md" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">TIPO:</span>
          <TipoBadge tipo={ticket.tipoTicket} size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'detalles' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Cliente Card */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {ticket.cliente.nombre} {ticket.cliente.apellido}
                </h2>
                <p className="text-gray-500">ID: {ticket.cliente.idCliente}</p>
              </div>
            </div>

            {/* Cliente Details */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">DNI:</span>
                  <span className="text-gray-900">{ticket.cliente.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha de Nacimiento:</span>
                  <span className="text-gray-900">{formatDate(ticket.cliente.fechaNacimiento)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Correo:</span>
                  <span className="text-gray-900">{ticket.cliente.correo}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="text-gray-900">{ticket.cliente.telefono || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Celular:</span>
                  <span className="text-gray-900">{ticket.cliente.celular}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción del ticket</h3>
              <p className="text-gray-600">{ticket.descripcion}</p>
            </div>

            {/* Info específica por tipo */}
            {ticket.consultaInfo && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700">Tema de consulta</h4>
                <p className="text-blue-600">{ticket.consultaInfo.tema}</p>
              </div>
            )}

            {ticket.quejaInfo && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="text-sm font-medium text-orange-700">Información de queja</h4>
                <p className="text-orange-600">Impacto: {ticket.quejaInfo.impacto}</p>
                <p className="text-orange-600">Área involucrada: {ticket.quejaInfo.areaInvolucrada}</p>
              </div>
            )}

            {ticket.reclamoInfo && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h4 className="text-sm font-medium text-red-700">Información de reclamo</h4>
                <p className="text-red-600">Motivo: {ticket.reclamoInfo.motivoReclamo}</p>
                <p className="text-red-600">Fecha límite respuesta: {formatDate(ticket.reclamoInfo.fechaLimiteRespuesta)}</p>
                <p className="text-red-600">Fecha límite resolución: {formatDate(ticket.reclamoInfo.fechaLimiteResolucion)}</p>
              </div>
            )}

            {ticket.solicitudInfo && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700">Tipo de solicitud</h4>
                <p className="text-purple-600">{ticket.solicitudInfo.tipoSolicitud}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentacion' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentación del caso</h3>
            {documentacion.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay documentación registrada para este ticket.
              </p>
            ) : (
              <div className="space-y-4">
                {documentacion.map((doc) => (
                  <div key={doc.idDocumentacion} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        {doc.empleado.nombre} {doc.empleado.apellido}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(doc.fechaCreacion)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Problema:</h4>
                    <p className="text-gray-600 text-sm mb-2">{doc.problema}</p>
                    <h4 className="font-medium text-gray-900 mb-1">Solución:</h4>
                    <p className="text-gray-600 text-sm">{doc.solucion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hilo' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de asignaciones</h3>
            {asignaciones.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay historial de asignaciones para este ticket.
              </p>
            ) : (
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {asignaciones.map((asig, index) => (
                    <div key={asig.idAsignacion} className="relative pl-10">
                      <div
                        className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                          index === 0
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}
                      ></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            {asig.empleado
                              ? `${asig.empleado.nombre} ${asig.empleado.apellido}`
                              : 'Sin asignar'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(asig.fechaInicio)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {asig.tipo} - {asig.area}
                        </p>
                        {asig.motivoDesplazamiento && (
                          <p className="text-sm text-gray-600 mt-1">
                            Motivo: {asig.motivoDesplazamiento}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
