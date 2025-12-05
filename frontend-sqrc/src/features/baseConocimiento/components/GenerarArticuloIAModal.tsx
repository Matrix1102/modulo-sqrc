import React, { useState } from "react";
import { Sparkles, X, FileText, Upload } from "lucide-react";
import GenerarDesdeDocumentacionModal from "./GenerarDesdeDocumentacionModal";
import GenerarDesdeDocumentoModal from "./GenerarDesdeDocumentoModal";
import type { ArticuloGeneradoIA } from "../types/articulo";

type TabType = 'documentacion' | 'documento';

interface GenerarArticuloIAModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCreador: number;
  onArticuloGenerado: (articulo: ArticuloGeneradoIA) => void;
  /** Tab inicial: 'documentacion' o 'documento' */
  tabInicial?: TabType;
}

/**
 * Modal combinado para generar artículos con IA.
 * Ofrece dos opciones:
 * - Desde Documentación: Usa ID de documentación de ticket
 * - Subir Documento: Sube PDF, Word o TXT
 * 
 * Este modal actúa como wrapper de los modales individuales.
 * Para uso independiente, importa GenerarDesdeDocumentacionModal o GenerarDesdeDocumentoModal.
 */
const GenerarArticuloIAModal: React.FC<GenerarArticuloIAModalProps> = ({
  isOpen,
  onClose,
  idCreador,
  onArticuloGenerado,
  tabInicial = 'documentacion',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(tabInicial);
  const [showSubModal, setShowSubModal] = useState(false);

  const handleClose = () => {
    setActiveTab(tabInicial);
    setShowSubModal(false);
    onClose();
  };

  const handleSelectOption = (tab: TabType) => {
    setActiveTab(tab);
    setShowSubModal(true);
  };

  const handleSubModalClose = () => {
    setShowSubModal(false);
  };

  const handleArticuloGenerado = (articulo: ArticuloGeneradoIA) => {
    setShowSubModal(false);
    onArticuloGenerado(articulo);
    handleClose();
  };

  if (!isOpen) return null;

  // Si hay un sub-modal abierto, mostrar ese
  if (showSubModal) {
    if (activeTab === 'documentacion') {
      return (
        <GenerarDesdeDocumentacionModal
          isOpen={true}
          onClose={handleSubModalClose}
          idCreador={idCreador}
          onArticuloGenerado={handleArticuloGenerado}
        />
      );
    } else {
      return (
        <GenerarDesdeDocumentoModal
          isOpen={true}
          onClose={handleSubModalClose}
          idCreador={idCreador}
          onArticuloGenerado={handleArticuloGenerado}
        />
      );
    }
  }

  // Modal selector principal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Generar con IA
                </h2>
                <p className="text-purple-200 text-sm">
                  Selecciona una opción
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body - Opciones */}
        <div className="p-6 space-y-4">
          {/* Opción Documentación */}
          <button
            onClick={() => handleSelectOption('documentacion')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all flex items-start gap-4 text-left group"
          >
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                Desde Documentación
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Genera un artículo usando el ID de documentación de un ticket existente
              </p>
            </div>
          </button>

          {/* Opción Documento */}
          <button
            onClick={() => handleSelectOption('documento')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all flex items-start gap-4 text-left group"
          >
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                Subir Documento
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Sube un archivo PDF, Word o TXT para generar un artículo
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerarArticuloIAModal;
