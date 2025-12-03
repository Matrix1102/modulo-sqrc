import React from "react";

interface TicketDescriptionProps {
  descripcion: string;
}

const TicketDescription: React.FC<TicketDescriptionProps> = ({ descripcion }) => {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Descripción</h3>
      <p className="mt-2 text-sm text-gray-700">{descripcion}</p>
    </article>
  );
};

export default TicketDescription;
