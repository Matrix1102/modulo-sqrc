/**
 * ResponderDerivacionModal - Modal para responder derivaciones
 * 
 * Formulario para que el área externa registre su respuesta
 */

import { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { TicketDerivadoSimuladorDTO, RegistrarRespuestaRequest } from '../types';
import { registrarRespuestaDerivacion } from '../services/simuladorApi';
import showNotification from '../../../services/notification';

interface ResponderDerivacionModalProps {
  ticket: TicketDerivadoSimuladorDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResponderDerivacionModal({
  ticket,
  onClose,
  onSuccess,
}: ResponderDerivacionModalProps) {
  const [formData, setFormData] = useState<RegistrarRespuestaRequest>({
    respuestaExterna: '',
    solucionado: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrarRespuestaRequest, string>>>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.respuestaExterna.trim()) {
      newErrors.respuestaExterna = 'La respuesta es obligatoria';
    } else if (formData.respuestaExterna.trim().length < 10) {
      newErrors.respuestaExterna = 'La respuesta debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await registrarRespuestaDerivacion(ticket.idTicket, formData);

      showNotification(
        `✅ Respuesta registrada para el ticket #${ticket.idTicket}`,
        'success'
      );

      onSuccess();
    } catch (error: any) {
      console.error('Error al registrar respuesta:', error);
      showNotification(
        `❌ Error: ${error.response?.data?.message || 'No se pudo registrar la respuesta'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Responder Derivación</h2>
              <p className="text-sm text-blue-100 mt-0.5">
                Ticket #{ticket.idTicket} - {ticket.asunto}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contexto del ticket */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📩 {ticket.notificacion.asunto}
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">
              {ticket.notificacion.cuerpo}
            </p>
          </div>

          {/* Respuesta Externa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Respuesta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.respuestaExterna}
              onChange={(e) =>
                setFormData({ ...formData, respuestaExterna: e.target.value })
              }
              placeholder="Describe la solución, información o comentarios relevantes..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.respuestaExterna
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              rows={6}
              disabled={loading}
            />
            {errors.respuestaExterna && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.respuestaExterna}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 10 caracteres - Sé claro y detallado
            </p>
          </div>

          {/* Checkbox Solucionado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.solucionado}
                onChange={(e) =>
                  setFormData({ ...formData, solucionado: e.target.checked })
                }
                className="mt-1 w-5 h-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <div>
                <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar como solucionado
                </span>
                <p className="text-xs text-blue-700 mt-1">
                  Indica que el ticket puede ser cerrado por el BackOffice. Si el problema persiste o requiere seguimiento, déjalo sin marcar.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Respuesta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
