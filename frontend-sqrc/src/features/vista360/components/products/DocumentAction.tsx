import React from "react";
import { FileDown } from "lucide-react";

interface DocumentActionProps {
  onClick?: () => void;
  title?: string;
}

const DocumentAction: React.FC<DocumentActionProps> = ({ onClick, title = "Descargar comprobante" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      aria-label={title}
    >
      <FileDown size={18} />
    </button>
  );
};

export default DocumentAction;
