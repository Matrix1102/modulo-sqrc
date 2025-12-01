import React from "react";
import { FileText } from "lucide-react";
import { formatDateTime } from "../../helpers";
import type { DocumentacionDto } from "../../../../../../services/vista360Api";

interface DocumentationDetailsProps {
  documentacion: DocumentacionDto;
}

/**
 * Componente expandible que muestra la documentación asociada a una asignación.
 */
const DocumentationDetails: React.FC<DocumentationDetailsProps> = ({ documentacion }) => {
  return (
    <details className="rounded-lg border border-gray-200 bg-white p-3">
      <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-900">
        <FileText size={16} />
        Documentación
      </summary>
      <div className="mt-2 space-y-2 text-xs text-gray-700">
        <div>
          <strong>Problema:</strong>
          <p className="mt-1">{documentacion.problema}</p>
        </div>
        <div>
          <strong>Solución:</strong>
          <p className="mt-1">{documentacion.articulo}</p>
        </div>
        <div>
          <strong>Fecha Creación:</strong>{" "}
          {formatDateTime(new Date(documentacion.fechaCreacion))}
        </div>
        {documentacion.autor && (
          <div>
            <strong>Autor:</strong> {documentacion.autor.nombre}{" "}
            {documentacion.autor.apellido}
          </div>
        )}
        {documentacion.articuloKB && (
          <div className="mt-2 rounded-md bg-blue-50 border border-blue-200 p-2">
            <strong className="text-blue-900">Artículo KB:</strong>
            <div className="text-blue-800 mt-1">
              <div>ID: {documentacion.articuloKB.idArticuloKB}</div>
              <div>Título: {documentacion.articuloKB.titulo}</div>
            </div>
          </div>
        )}
      </div>
    </details>
  );
};

export default DocumentationDetails;
