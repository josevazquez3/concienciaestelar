"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  formatBirthDate,
  parseBirthDate,
  type PadronClienteRecord,
} from "@/lib/clientes-padron-shared";

interface PadronClienteModalProps {
  cliente?: PadronClienteRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PadronClienteModal({
  cliente = null,
  onClose,
  onSaved,
}: PadronClienteModalProps) {
  const isEdit = Boolean(cliente);
  const [nombres, setNombres] = useState(cliente?.nombres ?? "");
  const [apellidos, setApellidos] = useState(cliente?.apellidos ?? "");
  const [documento, setDocumento] = useState(cliente?.documento ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(
    cliente?.fechaNacimiento
      ? formatBirthDate(new Date(cliente.fechaNacimiento))
      : ""
  );
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [celular, setCelular] = useState(cliente?.celular ?? "");
  const [residencia, setResidencia] = useState(cliente?.residencia ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!nombres.trim() && !apellidos.trim()) {
      setError("Indicá al menos nombres o apellidos.");
      setSaving(false);
      return;
    }

    if (fechaNacimiento.trim() && !parseBirthDate(fechaNacimiento)) {
      setError("Fecha de nacimiento inválida (usá DD/MM/YYYY).");
      setSaving(false);
      return;
    }

    if (documento.trim() && !/^\d+$/.test(documento.trim())) {
      setError("DNI o Pasaporte debe contener solo números.");
      setSaving(false);
      return;
    }

    const payload = {
      nombres,
      apellidos,
      documento,
      fechaNacimiento,
      email,
      celular,
      residencia,
    };

    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/clientes/padron/${cliente!.id}`
          : "/api/admin/clientes/padron",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-gold/20 bg-warm-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            {isEdit ? "Editar cliente" : "Carga manual de cliente"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-navy/50 hover:bg-navy/5"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="section-label mb-2 block" htmlFor="pc-nombres">
              Nombres
            </label>
            <input
              id="pc-nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="input-field"
              maxLength={120}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="pc-apellidos">
              Apellidos
            </label>
            <input
              id="pc-apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="input-field"
              maxLength={120}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="pc-documento">
              DNI o Pasaporte
            </label>
            <input
              id="pc-documento"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={documento}
              onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ""))}
              className="input-field"
              maxLength={15}
              placeholder="Solo números"
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="pc-fecha">
              Fecha de Nacimiento
            </label>
            <input
              id="pc-fecha"
              type="text"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="input-field"
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="pc-email">
              Correo electrónico
            </label>
            <input
              id="pc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              maxLength={120}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="pc-celular">
              Nº de Celular
            </label>
            <input
              id="pc-celular"
              type="text"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="input-field"
              maxLength={40}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="section-label mb-2 block" htmlFor="pc-residencia">
              Lugar de residencia
            </label>
            <input
              id="pc-residencia"
              type="text"
              value={residencia}
              onChange={(e) => setResidencia(e.target.value)}
              className="input-field"
              maxLength={200}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline w-full sm:w-auto"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary w-full sm:w-auto"
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Agregar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
