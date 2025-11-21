import React, { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  onSearch?: (value: string) => void;
}

const CustomerSearch: React.FC<Props> = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const doSearch = () => {
    onSearch?.(value.trim());
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && doSearch()}
        placeholder="Ingrese DNI o ID del cliente"
        className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
      />
      <button
        type="button"
        onClick={doSearch}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
      >
        <Search size={16} />
        Buscar
      </button>
    </div>
  );
};

export default CustomerSearch;
