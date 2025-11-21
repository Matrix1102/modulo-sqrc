import React, { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";
import ActionButton from "./ActionButton";

const Labeled = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
    <div className="w-full text-sm font-medium text-gray-600 sm:w-32 sm:shrink-0">{label}:</div>
    <div className="flex-1">{children}</div>
  </div>
);

const CustomerProfileForm: React.FC = () => {
  // Placeholder data; in real usage these would come from props or a hook
  const data = {
    id: "100782",
    dni: "74935134",
    nombre: "Miguel Alejandro",
    apellido: "Giron Altamirano",
    fechaNacimiento: "2004-10-06",
    correo: "miguel@unmsm.edu.pe",
    telefono: "749 164 25",
    celular: "999 280 446",
  } as const;

  const [birthdate, setBirthdate] = useState<string>(data.fechaNacimiento);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const triggerDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-2">
        <Labeled label="ID">
          <input
            readOnly
            value={data.id}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
      </div>

      <CollapsibleSection title="Datos personales" defaultOpen>
        <Labeled label="DNI">
          <input
            readOnly
            value={data.dni}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
        <Labeled label="Nombre">
          <input
            readOnly
            value={data.nombre}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
        <Labeled label="Apellido">
          <input
            readOnly
            value={data.apellido}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
        <Labeled label="Fecha nacimiento">
          <div className="relative flex w-full items-center">
            <input
              ref={dateInputRef}
              type="date"
              value={birthdate}
              onChange={(event) => setBirthdate(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-12"
            />
            <button
              type="button"
              onClick={triggerDatePicker}
              className="absolute right-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="Seleccionar fecha de nacimiento"
            >
              <Calendar size={16} />
            </button>
          </div>
        </Labeled>
      </CollapsibleSection>

      <CollapsibleSection title="Datos de contacto" defaultOpen>
        <Labeled label="Correo">
          <input
            readOnly
            value={data.correo}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
        <Labeled label="Teléfono">
          <input
            readOnly
            value={data.telefono}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
        <Labeled label="Celular">
          <input
            readOnly
            value={data.celular}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </Labeled>
      </CollapsibleSection>

      <div className="mt-auto pt-2">
        <ActionButton onClick={() => alert("Modificar Información (placeholder)")}>
          Modificar información
        </ActionButton>
      </div>
    </div>
  );
};

export default CustomerProfileForm;
