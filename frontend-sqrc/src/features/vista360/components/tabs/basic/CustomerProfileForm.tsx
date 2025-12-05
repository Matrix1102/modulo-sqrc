import React, { useState, useEffect } from "react";
import { CollapsibleSection, ActionButton, ConfirmationModal } from "../../common";
import type { ClienteBasicoDTO } from "../../../../../services/vista360Api";
import { actualizarInformacionCliente } from "../../../../../services/vista360Api";

const Labeled = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
    <div className="w-full text-sm font-medium text-gray-600 sm:w-32 sm:shrink-0">{label}:</div>
    <div className="flex-1">{children}</div>
  </div>
);

// Badge para mostrar el estado del cliente
const EstadoBadge = ({ estado }: { estado: string }) => {
  const colorClass = estado?.toUpperCase() === "ACTIVO" 
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-red-100 text-red-800 border-red-200";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {estado || "N/A"}
    </span>
  );
};

// Badge para mostrar la categoría del cliente
const CategoriaBadge = ({ categoria }: { categoria: string }) => {
  const colorClass = categoria?.toLowerCase() === "premium" 
    ? "bg-purple-100 text-purple-800 border-purple-200"
    : "bg-blue-100 text-blue-800 border-blue-200";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {categoria || "Estándar"}
    </span>
  );
};

interface Props {
  cliente: ClienteBasicoDTO | null;
  loading?: boolean;
  onClienteUpdated?: (cliente: ClienteBasicoDTO) => void;
}

const CustomerProfileForm: React.FC<Props> = ({ cliente, loading, onClienteUpdated }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  
  // Campos editables
  const [dni, setDni] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [fechaRegistro, setFechaRegistro] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cliente) {
      setDni(cliente.dni || "");
      setNombre(cliente.nombre || "");
      setApellido(cliente.apellido || "");
      setCorreo(cliente.correo || "");
      setTelefono(cliente.telefono || "");
      setDireccion(cliente.direccion || "");
      setFechaRegistro(cliente.fechaRegistro || "");
      setEstado(cliente.estado || "ACTIVO");
      setCategoria(cliente.categoria || "Estándar");
      setIsEditing(false);
      setError(null);
    }
  }, [cliente]);

  const handleSave = () => {
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    if (!cliente) return;

    setIsSaving(true);
    setError(null);

    try {
      const datosActualizados = {
        dni: dni.trim() || undefined,
        nombre: nombre.trim() || undefined,
        apellido: apellido.trim() || undefined,
        correo: correo.trim() || undefined,
        telefono: telefono.trim() || undefined,
        direccion: direccion.trim() || undefined,
        fechaRegistro: fechaRegistro || undefined,
        estado: estado || undefined,
        categoria: categoria || undefined,
      };

      const clienteActualizado = await actualizarInformacionCliente(
        cliente.idCliente,
        datosActualizados
      );

      setIsEditing(false);
      setShowConfirmModal(false);
      onClienteUpdated?.(clienteActualizado);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la información");
      setShowConfirmModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (cliente) {
      setDni(cliente.dni || "");
      setNombre(cliente.nombre || "");
      setApellido(cliente.apellido || "");
      setCorreo(cliente.correo || "");
      setTelefono(cliente.telefono || "");
      setDireccion(cliente.direccion || "");
      setFechaRegistro(cliente.fechaRegistro || "");
      setEstado(cliente.estado || "ACTIVO");
      setCategoria(cliente.categoria || "Estándar");
      setIsEditing(false);
      setError(null);
    }
  };

  const inputClassName = (editable: boolean) =>
    `w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
      editable
        ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        : "border-gray-200 bg-gray-50"
    }`;

  if (loading) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Cargando datos del cliente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-sm font-medium">No hay cliente seleccionado</p>
            <p className="text-xs mt-1">Busca un cliente por ID</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header con ID, Estado y Categoría */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">ID: {cliente.idCliente}</span>
          <EstadoBadge estado={cliente.estado} />
          <CategoriaBadge categoria={cliente.categoria} />
        </div>
        {cliente.fechaRegistro && (
          <span className="text-xs text-gray-500">
            Registro: {new Date(cliente.fechaRegistro).toLocaleDateString()}
          </span>
        )}
      </div>

      <CollapsibleSection title="Datos personales" defaultOpen>
        <Labeled label="DNI">
          <input
            readOnly={!isEditing}
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Documento de identidad"
            maxLength={8}
            className={inputClassName(isEditing)}
          />
        </Labeled>
        <Labeled label="Nombre">
          <input
            readOnly={!isEditing}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del cliente"
            className={inputClassName(isEditing)}
          />
        </Labeled>
        <Labeled label="Apellido">
          <input
            readOnly={!isEditing}
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Apellido del cliente"
            className={inputClassName(isEditing)}
          />
        </Labeled>
        <Labeled label="Nombre completo">
          <input
            readOnly
            value={`${nombre} ${apellido}`.trim() || cliente.nombreCompleto || ""}
            placeholder="Nombre completo"
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 cursor-not-allowed"
          />
        </Labeled>
      </CollapsibleSection>

      <CollapsibleSection title="Datos de contacto" defaultOpen>
        <Labeled label="Correo">
          <input
            readOnly={!isEditing}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.com"
            className={inputClassName(isEditing)}
          />
        </Labeled>
        <Labeled label="Teléfono">
          <input
            readOnly={!isEditing}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Número de teléfono"
            className={inputClassName(isEditing)}
          />
        </Labeled>
        <Labeled label="Dirección">
          <input
            readOnly={!isEditing}
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección del cliente"
            className={inputClassName(isEditing)}
          />
        </Labeled>
      </CollapsibleSection>

      <CollapsibleSection title="Estado y Categoría" defaultOpen={false}>
        <Labeled label="Estado">
          {isEditing ? (
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          ) : (
            <input
              readOnly
              value={estado}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            />
          )}
        </Labeled>
        <Labeled label="Categoría">
          {isEditing ? (
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Estándar">Estándar</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          ) : (
            <input
              readOnly
              value={categoria}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            />
          )}
        </Labeled>
        <Labeled label="Fecha de registro">
          <input
            type="date"
            readOnly={!isEditing}
            value={fechaRegistro}
            onChange={(e) => setFechaRegistro(e.target.value)}
            className={inputClassName(isEditing)}
          />
        </Labeled>
      </CollapsibleSection>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-auto pt-2 flex gap-2">
        {!isEditing ? (
          <ActionButton onClick={() => setIsEditing(true)} className="flex-1">
            Modificar información
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={handleSave} disabled={isSaving} className="flex-1">
              Guardar cambios
            </ActionButton>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirmar cambios"
        message="¿Estás seguro de que deseas guardar los cambios realizados en la información del cliente?"
        confirmText="Sí, guardar"
        cancelText="No, volver"
        onConfirm={confirmSave}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isSaving}
      />
    </div>
  );
};

export default CustomerProfileForm;
