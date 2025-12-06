/**
 * Modal para escalar un ticket de Agente a BackOffice
 * 
 * Funcionalidad: Permite al agente llenar un formulario con:
 * - Asunto del escalamiento
 * - Problemática técnica
 * - Justificación del escalamiento
 * 
 * Al enviar, llama al endpoint POST /api/v1/tickets/{id}/escalar
 */

import { useState } from 'react';
import type { EscalarTicketRequest } from '../types';
import { escalarTicket } from '../services/ticketWorkflowApi';
import { showToast } from '../../../services/notification';

interface EscalarTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  onSuccess?: () => void;
}

export const EscalarTicketModal = ({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}: EscalarTicketModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EscalarTicketRequest>({
    asunto: '',
    problematica: '',
    justificacion: '',
  });

  const handleChange = (field: keyof EscalarTicketRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!formData.asunto.trim()) {
      showToast('El asunto es obligatorio', 'warning');
      return;
    }
    if (!formData.problematica.trim()) {
      showToast('La problemática es obligatoria', 'warning');
      return;
    }
    if (!formData.justificacion.trim()) {
      showToast('La justificación es obligatoria', 'warning');
      return;
    }

    setLoading(true);

    try {
      const mensaje = await escalarTicket(ticketId, formData);
      showToast(mensaje || 'Ticket escalado exitosamente', 'success');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al escalar el ticket';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      asunto: '',
      problematica: '',
      justificacion: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Escalar Ticket a BackOffice</h2>
              <p className="text-yellow-100 text-sm">Ticket #{ticketId}</p>
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
            Complete el formulario para escalar este ticket al área de BackOffice. 
            Todos los campos son obligatorios.
          </p>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Asunto del Escalamiento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.asunto}
              onChange={(e) => handleChange('asunto', e.target.value)}
              placeholder="Ej: Router sin conexión a internet"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Problemática */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Problemática Técnica <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.problematica}
              onChange={(e) => handleChange('problematica', e.target.value)}
              placeholder="Describa detalladamente el problema técnico que presenta el cliente..."
              rows={4}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.problematica.length} caracteres
            </p>
          </div>

          {/* Justificación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Justificación del Escalamiento <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.justificacion}
              onChange={(e) => handleChange('justificacion', e.target.value)}
              placeholder="Explique por qué este caso requiere la intervención de BackOffice..."
              rows={4}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.justificacion.length} caracteres
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>El ticket cambiará al estado "ESCALADO"</li>
                  <li>Se notificará al equipo de BackOffice</li>
                  <li>Se registrará esta acción en el historial del ticket</li>
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
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-yellow-500 rounded-lg 
                     hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Escalando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Escalar Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
