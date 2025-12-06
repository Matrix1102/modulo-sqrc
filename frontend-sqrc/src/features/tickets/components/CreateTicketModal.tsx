/**
 * Modal para crear un nuevo ticket
 */
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ClienteDTO, TipoTicket, OrigenTicket, CreateTicketRequest } from '../types';
import { createTicket } from '../services/ticketApi';
import { asociarLlamadaATicket } from '../services/llamadaApi';

// Mapeo de roles a empleados de la BD local
const ROLE_CONFIG: Record<string, { empleadoId: number; origen: OrigenTicket; label: string; nombreAgente: string }> = {
  'agente-llamada': { empleadoId: 6, origen: 'LLAMADA', label: 'Llamada', nombreAgente: 'Sofia Call' },           // ID 6 - Local
  'agente-presencial': { empleadoId: 9, origen: 'PRESENCIAL', label: 'Presencial', nombreAgente: 'Fernando Face' }, // ID 9 - Local
  'backoffice': { empleadoId: 3, origen: 'LLAMADA', label: 'Backoffice', nombreAgente: 'Jorge Resolver' },        // ID 3 - Local
};

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: ClienteDTO;
  onTicketCreated: (ticketId: number) => void;
  activeLlamadaId?: number | null; // ID de la llamada activa (si existe)
}

export const CreateTicketModal = ({
  isOpen,
  onClose,
  cliente,
  onTicketCreated,
  activeLlamadaId,
}: CreateTicketModalProps) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detectar rol actual basado en la ruta
  const getCurrentRole = () => {
    const path = location.pathname;
    if (path.startsWith('/agente-llamada')) return 'agente-llamada';
    if (path.startsWith('/agente-presencial')) return 'agente-presencial';
    if (path.startsWith('/backoffice')) return 'backoffice';
    return 'agente-llamada'; // fallback
  };

  const currentRole = getCurrentRole();
  const roleConfig = ROLE_CONFIG[currentRole];

  // Form fields
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoTicket, setTipoTicket] = useState<TipoTicket>('CONSULTA');

  // Campos específicos por tipo
  const [tema, setTema] = useState(''); // CONSULTA
  const [impacto, setImpacto] = useState(''); // QUEJA
  const [areaInvolucrada, setAreaInvolucrada] = useState(''); // QUEJA
  const [motivoReclamo, setMotivoReclamo] = useState(''); // RECLAMO
  const [tipoSolicitud, setTipoSolicitud] = useState(''); // SOLICITUD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asunto.trim() || !descripcion.trim()) {
      setError('Complete todos los campos obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: CreateTicketRequest = {
        tipoTicket,
        asunto,
        descripcion,
        clienteId: cliente.idCliente,
        origen: roleConfig.origen, // Origen fijo según rol
        empleadoId: roleConfig.empleadoId, // Empleado de API externa según rol
      };

      // Agregar campos específicos según el tipo
      switch (tipoTicket) {
        case 'CONSULTA':
          request.tema = tema;
          break;
        case 'QUEJA':
          request.impacto = impacto;
          request.areaInvolucrada = areaInvolucrada;
          break;
        case 'RECLAMO':
          request.motivoReclamo = motivoReclamo;
          break;
        case 'SOLICITUD':
          request.tipoSolicitud = tipoSolicitud;
          break;
      }

      const response = await createTicket(request);
      
      // Si hay una llamada activa, asociarla automáticamente al ticket
      if (activeLlamadaId) {
        try {
          const llamadaAsociada = await asociarLlamadaATicket({
            llamadaId: activeLlamadaId,
            ticketId: response.idTicket,
          });
          console.log('✅ Llamada asociada exitosamente:', {
            llamadaId: activeLlamadaId,
            ticketId: response.idTicket,
            numeroOrigen: llamadaAsociada.numeroOrigen
          });
        } catch (error) {
          console.error('❌ Error al asociar llamada al ticket:', error);
          // No bloquear la creación del ticket si falla la asociación
        }
      }
      
      onTicketCreated(response.idTicket);
    } catch {
      setError('Error al crear el ticket. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAsunto('');
    setDescripcion('');
    setTipoTicket('CONSULTA');
    setTema('');
    setImpacto('');
    setAreaInvolucrada('');
    setMotivoReclamo('');
    setTipoSolicitud('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={handleClose}
      />

      {/* Panel lateral (Drawer) */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Crear Ticket</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Indicador de llamada activa */}
              {activeLlamadaId && (
                <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-lg p-3 flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">Llamada activa</p>
                    <p className="text-xs text-green-600">Este ticket se asociará automáticamente a la llamada en curso</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Asunto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto del ticket :
                  </label>
                  <input
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    placeholder="Título del ticket"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Propietario (agente actual basado en rol) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Propietario del ticket :
                  </label>
                  <input
                    type="text"
                    value={roleConfig.nombreAgente}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del ticket :
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Breve descripción de la problemática del caso"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente :
                  </label>
                  <input
                    type="text"
                    value={`${cliente.nombre} ${cliente.apellido}`}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                {/* Tipo de Ticket */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Ticket :
                  </label>
                  <select
                    value={tipoTicket}
                    onChange={(e) => setTipoTicket(e.target.value as TipoTicket)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CONSULTA">Consulta</option>
                    <option value="QUEJA">Queja</option>
                    <option value="RECLAMO">Reclamo</option>
                    <option value="SOLICITUD">Solicitud</option>
                  </select>
                </div>

                {/* Campos específicos según el tipo */}
                {tipoTicket === 'CONSULTA' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tema de consulta :
                    </label>
                    <input
                      type="text"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      placeholder="Tema de la consulta"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {tipoTicket === 'QUEJA' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impacto :
                      </label>
                      <select
                        value={impacto}
                        onChange={(e) => setImpacto(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione impacto</option>
                        <option value="BAJO">Bajo</option>
                        <option value="MEDIO">Medio</option>
                        <option value="ALTO">Alto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Área involucrada :
                      </label>
                      <input
                        type="text"
                        value={areaInvolucrada}
                        onChange={(e) => setAreaInvolucrada(e.target.value)}
                        placeholder="Área involucrada"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {tipoTicket === 'RECLAMO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo del reclamo :
                    </label>
                    <input
                      type="text"
                      value={motivoReclamo}
                      onChange={(e) => setMotivoReclamo(e.target.value)}
                      placeholder="Motivo del reclamo"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {tipoTicket === 'SOLICITUD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de solicitud :
                    </label>
                    <input
                      type="text"
                      value={tipoSolicitud}
                      onChange={(e) => setTipoSolicitud(e.target.value)}
                      placeholder="Tipo de solicitud"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Canal - Automático según tipo de agente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canal :
                  </label>
                  <input
                    type="text"
                    value={roleConfig.label}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Asignado automáticamente según tu rol
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-full font-medium transition-colors ${
                    loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </span>
                  ) : (
                    'Crear Ticket'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
