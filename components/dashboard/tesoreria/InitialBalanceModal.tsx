"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  formatAmountForInput,
  parseArsAmount,
  toDateInputValue,
} from "@/lib/bank-statement-shared";

interface InitialBalanceModalProps {
  initialBalance: number;
  initialBalanceDate: string;
  onClose: () => void;
  onSaved: (config: { initialBalance: number; initialBalanceDate: string }) => void;
}

export function InitialBalanceModal({
  initialBalance,
  initialBalanceDate,
  onClose,
  onSaved,
}: InitialBalanceModalProps) {
  const [balanceInput, setBalanceInput] = useState(
    formatAmountForInput(initialBalance)
  );
  const [dateInput, setDateInput] = useState(
    toDateInputValue(initialBalanceDate) || toDateInputValue(new Date().toISOString())
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    const balance = parseArsAmount(balanceInput);
    if (balance === null) {
      setError("Ingresá un saldo válido (ej: 12467742,38).");
      setSaving(false);
      return;
    }

    if (!dateInput) {
      setError("Seleccioná la fecha del saldo inicial.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/extracto-banco/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialBalance: balance,
          initialBalanceDate: dateInput,
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
            Saldo inicial
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

        <p className="mb-4 font-body text-sm text-navy/60">
          Definí el saldo de la cuenta al inicio del período. Se usa para calcular
          el saldo total junto con los movimientos importados.
        </p>

        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block" htmlFor="initial-balance">
              Monto
            </label>
            <input
              id="initial-balance"
              type="text"
              inputMode="decimal"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="input-field"
              placeholder="Ej: 12467742,38"
              autoFocus
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="initial-date">
              Fecha del saldo
            </label>
            <input
              id="initial-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="input-field"
              required
            />
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
            {saving ? "Guardando..." : "Guardar saldo inicial"}
          </button>
        </div>
      </div>
    </div>
  );
}
