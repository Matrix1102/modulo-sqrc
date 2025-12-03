import React from "react";
import { Globe, Inbox, FileEdit } from "lucide-react";

interface Props {
  activeTab?: string;
  onChange?: (tab: string) => void;
}

const tabs = [
  { key: "todos", label: "Todos los artículos", Icon: Globe },
  { key: "mis-articulos", label: "Mis artículos", Icon: Inbox },
  { key: "crear", label: "Crear Artículo", Icon: FileEdit },
];

const KBTabNavigation: React.FC<Props> = ({
  activeTab = "todos",
  onChange,
}) => {
  return (
    <nav className="bg-white">
      <ul className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <li key={t.key} className="min-w-40 flex-1 sm:min-w-0">
              <button
                type="button"
                onClick={() => onChange?.(t.key)}
                className={`flex w-full items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-center text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "border-b-2 border-blue-500 bg-blue-50 text-blue-600"
                      : "border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                aria-selected={isActive}
              >
                <t.Icon size={18} />
                <span>{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default KBTabNavigation;
