"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { BankAccountOption, BankMovementItem } from "./ExtractoBancoPanel";

interface OperationCodeModalProps {
  movement: BankMovementItem;
  accounts: BankAccountOption[];
  onClose: () => void;
  onSaved: (movement: BankMovementItem) => void;
}

export function OperationCodeModal({
  movement,
  accounts,
  onClose,
  onSaved,
}: OperationCodeModalProps) {
  const [operationCode, setOperationCode] = useState(movement.operationCode);
  const [bankAccountId, setBankAccountId] = useState(movement.bankAccountId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/extracto-banco/movements/${movement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationCode: operationCode.trim(),
          bankAccountId: bankAccountId || null,
        }),
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
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-gold/20 bg-warm-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            Editar código operativo
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

        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block" htmlFor="op-code">
              Cód. Op.
            </label>
            <input
              id="op-code"
              type="text"
              value={operationCode}
              onChange={(e) => setOperationCode(e.target.value)}
              className="input-field"
              maxLength={40}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="op-account">
              Cuenta
            </label>
            <select
              id="op-account"
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
              className="input-field"
            >
              <option value="">Sin clasificar</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
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
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
