/**
 * Modal para derivar un ticket de BackOffice a un Área Externa
 * 
 * Funcionalidad: Permite al BackOffice llenar un formulario con:
 * - Área destino (Select: TI, Ventas, Infraestructura)
 * - Asunto de la derivación
 * - Cuerpo del mensaje con detalles
 * 
 * Al enviar, llama al endpoint POST /api/v1/tickets/{id}/derivar
 */

import { useState } from 'react';
import type { DerivarTicketRequest } from '../types';
import { AREAS_EXTERNAS } from '../types';
import { derivarTicket } from '../services/ticketWorkflowApi';
import { showToast } from '../../../services/notification';

interface DerivarTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  onSuccess?: () => void;
}

export const DerivarTicketModal = ({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}: DerivarTicketModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DerivarTicketRequest>({
    areaDestinoId: 1, // Default: TI
    asunto: '',
    cuerpo: '',
  });

  const handleChange = (field: keyof DerivarTicketRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación
    if (!formData.areaDestinoId) {
      showToast('Debe seleccionar un área destino', 'warning');
      return;
    }
    if (!formData.asunto.trim()) {
      showToast('El asunto es obligatorio', 'warning');
      return;
    }
    if (!formData.cuerpo.trim()) {
      showToast('El cuerpo del mensaje es obligatorio', 'warning');
      return;
    }

    setLoading(true);

    try {
      const mensaje = await derivarTicket(ticketId, formData);
      showToast(mensaje || 'Ticket derivado exitosamente', 'success');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error al derivar el ticket';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      areaDestinoId: 1,
      asunto: '',
      cuerpo: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Derivar Ticket a Área Externa</h2>
              <p className="text-purple-100 text-sm">Ticket #{ticketId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:text-purple-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Área Destino */}
          <div>
            <label htmlFor="areaDestinoId" className="block text-sm font-semibold text-gray-700 mb-2">
              Área Destino <span className="text-red-500">*</span>
            </label>
            <select
              id="areaDestinoId"
              value={formData.areaDestinoId}
              onChange={(e) => handleChange('areaDestinoId', Number(e.target.value))}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {AREAS_EXTERNAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Seleccione el área externa que gestionará el ticket</p>
          </div>

          {/* Asunto */}
          <div>
            <label htmlFor="asunto" className="block text-sm font-semibold text-gray-700 mb-2">
              Asunto de la Derivación <span className="text-red-500">*</span>
            </label>
            <input
              id="asunto"
              type="text"
              value={formData.asunto}
              onChange={(e) => handleChange('asunto', e.target.value)}
              disabled={loading}
              placeholder="Ej: Solicitud de soporte técnico especializado"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">Título breve que resuma la derivación (máx. 200 caracteres)</p>
          </div>

          {/* Cuerpo */}
          <div>
            <label htmlFor="cuerpo" className="block text-sm font-semibold text-gray-700 mb-2">
              Mensaje y Detalles <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cuerpo"
              value={formData.cuerpo}
              onChange={(e) => handleChange('cuerpo', e.target.value)}
              disabled={loading}
              rows={6}
              placeholder="Describa en detalle el problema, acciones tomadas y por qué requiere intervención del área externa..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Incluya toda la información necesaria para que el área externa pueda actuar</p>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-purple-800">
              <p className="font-semibold mb-1">Información importante:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>El ticket cambiará a estado <strong>DERIVADO</strong></li>
                <li>Se enviará una notificación al área externa seleccionada</li>
                <li>Quedará en espera de respuesta externa para continuar</li>
              </ul>
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
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Derivando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Derivar Ticket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
