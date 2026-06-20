"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toDateInputValue } from "@/lib/bank-statement-config";
import type { BankMovementItem } from "./ExtractoBancoPanel";

interface BankMovementModalProps {
  movement?: BankMovementItem | null;
  onClose: () => void;
  onSaved: (movement: BankMovementItem) => void;
}

export function BankMovementModal({
  movement,
  onClose,
  onSaved,
}: BankMovementModalProps) {
  const isEdit = Boolean(movement);
  const [movementDate, setMovementDate] = useState(
    movement ? toDateInputValue(movement.movementDate) : toDateInputValue(new Date().toISOString())
  );
  const [branchCode, setBranchCode] = useState(movement?.branchCode ?? "");
  const [branchDescription, setBranchDescription] = useState(
    movement?.branchDescription ?? ""
  );
  const [operationCode, setOperationCode] = useState(movement?.operationCode ?? "");
  const [reference, setReference] = useState(movement?.reference ?? "");
  const [concept, setConcept] = useState(movement?.concept ?? "");
  const [amount, setAmount] = useState(
    movement ? String(movement.amount) : ""
  );
  const [runningBalance, setRunningBalance] = useState(
    movement?.runningBalance !== null && movement?.runningBalance !== undefined
      ? String(movement.runningBalance)
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!concept.trim()) {
      setError("El concepto es obligatorio.");
      setSaving(false);
      return;
    }

    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount)) {
      setError("Importe inválido.");
      setSaving(false);
      return;
    }

    const parsedBalance = runningBalance.trim()
      ? Number(runningBalance.replace(",", "."))
      : null;

    if (parsedBalance !== null && !Number.isFinite(parsedBalance)) {
      setError("Saldo inválido.");
      setSaving(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/admin/extracto-banco/movements/${movement!.id}`
        : "/api/admin/extracto-banco/movements";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movementDate,
          branchCode,
          branchDescription,
          operationCode,
          reference,
          concept,
          amount: parsedAmount,
          runningBalance: parsedBalance,
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-gold/20 bg-warm-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            {isEdit ? "Editar movimiento" : "Nuevo movimiento"}
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
            <label className="section-label mb-2 block" htmlFor="mv-date">
              Fecha
            </label>
            <input
              id="mv-date"
              type="date"
              value={movementDate}
              onChange={(e) => setMovementDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="mv-branch">
              Suc.
            </label>
            <input
              id="mv-branch"
              type="text"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="input-field"
              maxLength={20}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="section-label mb-2 block" htmlFor="mv-branch-desc">
              Desc. Sucursal
            </label>
            <input
              id="mv-branch-desc"
              type="text"
              value={branchDescription}
              onChange={(e) => setBranchDescription(e.target.value)}
              className="input-field"
              maxLength={80}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="mv-op">
              Cód. Op.
            </label>
            <input
              id="mv-op"
              type="text"
              value={operationCode}
              onChange={(e) => setOperationCode(e.target.value)}
              className="input-field"
              maxLength={40}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="mv-ref">
              Referencia
            </label>
            <input
              id="mv-ref"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="input-field"
              maxLength={40}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="section-label mb-2 block" htmlFor="mv-concept">
              Concepto
            </label>
            <input
              id="mv-concept"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="input-field"
              maxLength={200}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="mv-amount">
              Importe
            </label>
            <input
              id="mv-amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="20000 o -1500"
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="mv-balance">
              Saldo
            </label>
            <input
              id="mv-balance"
              type="text"
              value={runningBalance}
              onChange={(e) => setRunningBalance(e.target.value)}
              className="input-field"
              placeholder="Opcional"
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
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear movimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}
