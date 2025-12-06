/**
 * Modal para registrar la respuesta externa recibida de un área externa
 * 
 * Funcionalidad: Permite al BackOffice registrar:
 * - Respuesta externa recibida (texto)
 * - Si el problema fue solucionado (checkbox)
 * 
 * Al enviar, llama al endpoint POST /api/v1/tickets/{id}/respuesta-externa
 * Si solucionado=true, el ticket se cierra automáticamente
 * La respuesta se guarda en la misma notificación externa (tabla notificaciones_externas)
 */

import { useState } from 'react';
import type { RespuestaDerivacionDTO } from '../types';
import { registrarRespuestaExterna } from '../services/ticketWorkflowApi';
import { showToast } from '../../../services/notification';

interface RespuestaExternaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  onSuccess?: () => void;
}

export const RespuestaExternaModal = ({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}: RespuestaExternaModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RespuestaDerivacionDTO>({
    respuestaExterna: '',
    solucionado: false,
  });

  const handleChange = (field: keyof RespuestaDerivacionDTO, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!formData.respuestaExterna.trim()) {
      showToast('La respuesta externa es obligatoria', 'warning');
      return;
    }

    setLoading(true);

    try {
      const mensaje = await registrarRespuestaExterna(ticketId, formData);
      showToast(mensaje || 'Respuesta registrada exitosamente', 'success');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al registrar la respuesta';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      respuestaExterna: '',
      solucionado: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Registrar Respuesta Externa</h2>
              <p className="text-blue-100 text-sm">Ticket #{ticketId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:text-blue-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Respuesta Externa */}
          <div>
            <label htmlFor="respuestaExterna" className="block text-sm font-semibold text-gray-700 mb-2">
              Respuesta del Área Externa <span className="text-red-500">*</span>
            </label>
            <textarea
              id="respuestaExterna"
              value={formData.respuestaExterna}
              onChange={(e) => handleChange('respuestaExterna', e.target.value)}
              disabled={loading}
              rows={6}
              placeholder="Ingrese aquí la respuesta recibida del área externa. Incluya todos los detalles relevantes sobre las acciones tomadas, soluciones aplicadas o resultados obtenidos..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Copie o resuma la respuesta proporcionada por el área externa</p>
          </div>

          {/* Checkbox: Solucionado */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.solucionado}
                onChange={(e) => handleChange('solucionado', e.target.checked)}
                disabled={loading}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <span className="block text-sm font-semibold text-gray-700">
                  Problema solucionado
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Marque esta opción si el área externa resolvió completamente el problema. 
                  El ticket se cerrará automáticamente.
                </p>
              </div>
            </label>
          </div>

          {/* Info Box - Estado del Ticket */}
          <div className={`border rounded-lg p-4 flex gap-3 ${
            formData.solucionado 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <svg 
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                formData.solucionado ? 'text-green-600' : 'text-yellow-600'
              }`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className={`text-sm ${formData.solucionado ? 'text-green-800' : 'text-yellow-800'}`}>
              <p className="font-semibold mb-1">
                {formData.solucionado 
                  ? '✓ El ticket se cerrará automáticamente' 
                  : '⚠ El ticket permanecerá abierto'}
              </p>
              <p className="text-xs">
                {formData.solucionado
                  ? 'El estado cambiará a CERRADO y se generará documentación con la respuesta externa.'
                  : 'El ticket volverá a estado ABIERTO para continuar gestionándolo internamente.'}
              </p>
            </div>
          </div>
        </form>

        {/* Footer - Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Registrar Respuesta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
