"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { BankMovementItem } from "./ExtractoBancoPanel";

interface ConceptEditModalProps {
  movement: BankMovementItem;
  onClose: () => void;
  onSaved: (movement: BankMovementItem) => void;
}

export function ConceptEditModal({
  movement,
  onClose,
  onSaved,
}: ConceptEditModalProps) {
  const [concept, setConcept] = useState(movement.concept);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!concept.trim()) {
      setError("El concepto no puede estar vacío.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/extracto-banco/movements/${movement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: concept.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      onSaved(data);
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
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-gold/20 bg-warm-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            Editar concepto
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

        <div>
          <label className="section-label mb-2 block" htmlFor="movement-concept">
            Concepto
          </label>
          <textarea
            id="movement-concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="input-field min-h-[100px] resize-y"
            maxLength={200}
            rows={3}
            autoFocus
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-outline w-full sm:w-auto">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full disabled:opacity-70 sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar concepto"}
          </button>
        </div>
      </div>
    </div>
  );
}
