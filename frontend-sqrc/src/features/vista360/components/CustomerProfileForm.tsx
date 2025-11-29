import React, { useState, useEffect } from "react";
import CollapsibleSection from "./CollapsibleSection";
import ActionButton from "./ActionButton";
import ConfirmationModal from "./ConfirmationModal";
import type { ClienteBasicoDTO } from "../../../services/vista360Api";
import { actualizarInformacionCliente } from "../../../services/vista360Api";

const Labeled = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
    <div className="w-full text-sm font-medium text-gray-600 sm:w-32 sm:shrink-0">{label}:</div>
    <div className="flex-1">{children}</div>
  </div>
);

interface Props {
  cliente: ClienteBasicoDTO | null;
  loading?: boolean;
  onClienteUpdated?: (cliente: ClienteBasicoDTO) => void;
}

const CustomerProfileForm: React.FC<Props> = ({ cliente, loading, onClienteUpdated }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [dni, setDni] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [celular, setCelular] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cliente) {
      setDni(cliente.dni || "");
      setNombre(cliente.nombre || "");
      setApellido(cliente.apellido || "");
      setBirthdate(cliente.fechaNacimiento?.toString() || "");
      setCorreo(cliente.correo || "");
      setTelefono(cliente.telefono || "");
      setCelular(cliente.celular || "");
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
        dni: dni.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fechaNacimiento: birthdate,
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        celular: celular.trim(),
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
      setBirthdate(cliente.fechaNacimiento?.toString() || "");
      setCorreo(cliente.correo || "");
      setTelefono(cliente.telefono || "");
      setCelular(cliente.celular || "");
      setIsEditing(false);
      setError(null);
    }
  };

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
            <p className="text-xs mt-1">Busca un cliente por DNI o ID</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-2">
        <Labeled label="ID">
          <input
            readOnly
            value={cliente.idCliente}
            placeholder="ID del cliente"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 placeholder:text-gray-400/60"
          />
        </Labeled>
      </div>

      <CollapsibleSection title="Datos personales" defaultOpen>
        <Labeled label="DNI">
          <input
            readOnly={!isEditing}
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Documento de identidad"
            className={`w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50"
            }`}
          />
        </Labeled>
        <Labeled label="Nombre">
          <input
            readOnly={!isEditing}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del cliente"
            className={`w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50"
            }`}
          />
        </Labeled>
        <Labeled label="Apellido">
          <input
            readOnly={!isEditing}
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Apellido del cliente"
            className={`w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50"
            }`}
          />
        </Labeled>
        <Labeled label="Fecha nacimiento">
          <input
            type="date"
            disabled={!isEditing}
            value={birthdate}
            onChange={(event) => setBirthdate(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
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
            className={`w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50"
            }`}
          />
        </Labeled>
        <Labeled label="Teléfono">
          <input
            readOnly={!isEditing}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono fijo"
            className={`w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50"
            }`}
          />
        </Labeled>
        <Labeled label="Celular">
          <input
            readOnly={!isEditing}
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Número de celular"
            className={`w-full rounded-lg border px-3 py-2 placeholder:text-gray-400/60 ${
              isEditing
                ? "border-blue-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                : "border-gray-200 bg-gray-50"
            }`}
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
          <ActionButton onClick={() => setIsEditing(true)}>
            Modificar información
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={handleSave} disabled={isSaving}>
              Guardar cambios
            </ActionButton>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
