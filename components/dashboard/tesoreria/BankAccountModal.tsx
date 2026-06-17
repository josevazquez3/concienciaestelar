"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CuentaBancaria } from "./CuentasBancariasPanel";

interface BankAccountModalProps {
  account?: CuentaBancaria | null;
  onClose: () => void;
  onSaved: (account: CuentaBancaria) => void;
}

export function BankAccountModal({
  account,
  onClose,
  onSaved,
}: BankAccountModalProps) {
  const isEdit = Boolean(account);
  const [code, setCode] = useState(account?.code ?? "");
  const [operatingCode, setOperatingCode] = useState(account?.operatingCode ?? "");
  const [name, setName] = useState(account?.name ?? "");
  const [active, setActive] = useState(account?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSaving(true);
    setError("");

    if (!code.trim() || !name.trim()) {
      setError("Código y nombre son obligatorios.");
      setSaving(false);
      return;
    }

    try {
      const url = isEdit
        ? `/api/admin/cuentas-bancarias/${account!.id}`
        : "/api/admin/cuentas-bancarias";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          operatingCode: operatingCode.trim(),
          name: name.trim(),
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al guardar");
      }

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
      <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-gold/20 bg-warm-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            {isEdit ? "Editar cuenta" : "Nueva cuenta"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-navy/50 hover:bg-navy/5 hover:text-navy"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="section-label mb-2 block" htmlFor="bank-code">
              Código
            </label>
            <input
              id="bank-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field"
              placeholder="Ej: 01"
              maxLength={20}
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="bank-operating">
              Cód. operativo
            </label>
            <input
              id="bank-operating"
              type="text"
              value={operatingCode}
              onChange={(e) => setOperatingCode(e.target.value)}
              className="input-field"
              placeholder="CBU, alias interno, etc."
              maxLength={80}
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="bank-name">
              Nombre de la cuenta
            </label>
            <input
              id="bank-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej: transferencia Distritos"
              maxLength={120}
            />
          </div>

          <div>
            <label className="section-label mb-2 block" htmlFor="bank-status">
              Estado
            </label>
            <select
              id="bank-status"
              value={active ? "activa" : "inactiva"}
              onChange={(e) => setActive(e.target.value === "activa")}
              className="input-field"
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
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
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary w-full disabled:opacity-70 sm:w-auto"
          >
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
