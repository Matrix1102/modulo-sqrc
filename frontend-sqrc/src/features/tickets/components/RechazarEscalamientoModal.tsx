/**
 * Modal para rechazar un escalamiento y devolverlo al Agente
 * 
 * Funcionalidad: Permite al BackOffice rechazar un escalamiento indicando:
 * - Asunto del correo de respuesta
 * - Motivo del rechazo
 * - Instrucciones para que el Agente continúe
 * 
 * Al enviar, llama al endpoint POST /api/v1/tickets/{id}/rechazar-escalamiento
 * El ticket vuelve a estado ABIERTO para que el Agente lo retome con el feedback
 */

import { useState } from 'react';
import type { RechazarEscalamientoDTO } from '../types';
import { rechazarEscalamiento } from '../services/ticketWorkflowApi';
import { showToast } from '../../../services/notification';

interface RechazarEscalamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  onSuccess?: () => void;
}

export const RechazarEscalamientoModal = ({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}: RechazarEscalamientoModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RechazarEscalamientoDTO>({
    asunto: '',
    motivoRechazo: '',
    instrucciones: '',
  });

  const handleChange = (field: keyof RechazarEscalamientoDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!formData.asunto.trim()) {
      showToast('El asunto es obligatorio', 'warning');
      return;
    }
    if (!formData.motivoRechazo.trim()) {
      showToast('El motivo del rechazo es obligatorio', 'warning');
      return;
    }
    if (!formData.instrucciones.trim()) {
      showToast('Las instrucciones son obligatorias', 'warning');
      return;
    }

    setLoading(true);

    try {
      const mensaje = await rechazarEscalamiento(ticketId, formData);
      showToast(mensaje || 'Escalamiento rechazado. Ticket devuelto al Agente', 'success');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al rechazar el escalamiento';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      asunto: '',
      motivoRechazo: '',
      instrucciones: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rechazar Escalamiento</h2>
              <p className="text-red-100 text-sm">Ticket #{ticketId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          <p className="text-sm text-gray-600 mb-4">
            Complete el formulario para devolver este ticket al Agente con feedback específico. 
            El ticket volverá al estado <span className="font-semibold text-green-600">ABIERTO</span>.
          </p>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Asunto del Correo de Respuesta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.asunto}
              onChange={(e) => handleChange('asunto', e.target.value)}
              placeholder="Ej: Escalamiento rechazado - Se requiere más información"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Motivo del Rechazo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo del Rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.motivoRechazo}
              onChange={(e) => handleChange('motivoRechazo', e.target.value)}
              placeholder="Explique por qué no puede aceptar este escalamiento en este momento..."
              rows={4}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ejemplos: "El problema descrito no requiere intervención de BackOffice", 
              "Falta información técnica", "Debe intentar solución básica primero"
            </p>
          </div>

          {/* Instrucciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instrucciones para el Agente <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.instrucciones}
              onChange={(e) => handleChange('instrucciones', e.target.value)}
              placeholder="Indique qué pasos debe seguir el Agente antes de volver a escalar..."
              rows={5}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ejemplos: "Verificar conectividad del router", "Solicitar logs del sistema al cliente", 
              "Intentar reiniciar el servicio primero"
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>El ticket cambiará al estado "ABIERTO"</li>
                  <li>Se enviará un correo al Agente con el feedback</li>
                  <li>El Agente podrá volver a escalar si es necesario</li>
                  <li>Esta acción quedará registrada en el historial</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                     rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 
                     rounded-lg hover:from-red-600 hover:to-orange-600 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rechazando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Rechazar y Devolver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RechazarEscalamientoModal;
