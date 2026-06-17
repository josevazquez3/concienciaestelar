"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileSpreadsheet,
  FolderInput,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  BANK_ACCOUNT_CSV_HEADERS,
  formatBankAccountStatus,
} from "@/lib/bank-accounts";
import { downloadXlsx, xlsxFilename } from "@/lib/spreadsheet-export";
import { readSpreadsheetAsCsv, SPREADSHEET_ACCEPT } from "@/lib/spreadsheet-import";
import { BankAccountModal } from "./BankAccountModal";

export type CuentaBancaria = {
  id: string;
  code: string;
  operatingCode: string;
  name: string;
  active: boolean;
};

function matchesSearch(account: CuentaBancaria, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    account.code.toLowerCase().includes(q) ||
    account.operatingCode.toLowerCase().includes(q) ||
    account.name.toLowerCase().includes(q)
  );
}

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: CuentaBancaria;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-card border border-gold/20 bg-white/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-ui text-xs uppercase tracking-label text-navy/50">
            Código {account.code}
          </p>
          <p className="mt-1 break-words font-body font-medium text-navy">
            {account.name}
          </p>
          {account.operatingCode && (
            <p className="mt-1 break-all font-body text-sm text-navy/60">
              {account.operatingCode}
            </p>
          )}
        </div>
        <span
          className={
            account.active
              ? "shrink-0 font-body text-sm text-green-700"
              : "shrink-0 font-body text-sm text-red-600"
          }
        >
          {formatBankAccountStatus(account.active)}
        </span>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className="btn-outline flex-1 text-xs">
          <Pencil size={14} />
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-red-200 px-4 py-2.5 font-ui text-xs uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50"
          aria-label="Eliminar cuenta"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

export function CuentasBancariasPanel() {
  const [accounts, setAccounts] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CuentaBancaria | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cuentas-bancarias");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setAccounts(data);
    } catch {
      setError("No se pudieron cargar las cuentas bancarias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filtered = useMemo(
    () => accounts.filter((account) => matchesSearch(account, search)),
    [accounts, search]
  );

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cuenta bancaria?")) return;
    const res = await fetch(`/api/admin/cuentas-bancarias/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAccounts((prev) => prev.filter((account) => account.id !== id));
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar la cuenta");
    }
  }

  async function handleExport() {
    await downloadXlsx(
      xlsxFilename("cuentas-bancarias"),
      "Cuentas",
      BANK_ACCOUNT_CSV_HEADERS,
      accounts.map((account) => [
        account.code,
        account.operatingCode,
        account.name,
        formatBankAccountStatus(account.active),
      ])
    );
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    setImportMessage("");
    setError("");
    try {
      const text = await readSpreadsheetAsCsv(file);
      const res = await fetch("/api/admin/cuentas-bancarias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al importar");
      }
      setAccounts(data.accounts);
      setImportMessage(
        `Importación lista: ${data.created} nuevas, ${data.updated} actualizadas.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (loading) {
    return <p className="font-body text-navy/60">Cargando cuentas...</p>;
  }

  return (
    <>
      <div className="card-glass overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gold/15 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código o nom..."
              className="input-field pl-9"
              aria-label="Buscar cuentas"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={SPREADSHEET_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="btn-outline flex-1 text-xs sm:flex-none"
              title="Importar CSV o Excel"
            >
              <FolderInput size={16} />
              {importing ? "Importando..." : "Importar"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={accounts.length === 0}
              className="btn-outline flex-1 text-xs sm:flex-none"
            >
              <FileSpreadsheet size={16} />
              Exportar Excel
            </button>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="btn-primary flex-1 text-xs sm:flex-none"
            >
              <Plus size={16} />
              Nueva Cuenta
            </button>
          </div>
        </div>

        {error && (
          <p className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-5">
            {error}
          </p>
        )}

        {importMessage && (
          <p className="mx-4 mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 sm:mx-5">
            {importMessage}
          </p>
        )}

        {filtered.length === 0 ? (
          <p className="p-8 text-center font-body text-navy/60">
            {accounts.length === 0
              ? "No hay cuentas cargadas. Creá una o importá un archivo CSV."
              : "No hay resultados para tu búsqueda."}
          </p>
        ) : (
          <>
            <div className="grid gap-4 p-4 md:hidden">
              {filtered.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={() => setEditing(account)}
                  onDelete={() => handleDelete(account.id)}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                      Código
                    </th>
                    <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                      Cód. operativo
                    </th>
                    <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                      Nombre de la cuenta
                    </th>
                    <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                      Estado
                    </th>
                    <th className="px-4 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-gold/10 transition-colors last:border-0 hover:bg-sky-50/60"
                    >
                      <td className="px-4 py-3 font-medium text-navy">
                        {account.code}
                      </td>
                      <td className="max-w-[220px] break-all px-4 py-3 text-navy/80">
                        {account.operatingCode || "—"}
                      </td>
                      <td className="px-4 py-3 text-navy">{account.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            account.active ? "text-green-700" : "text-red-600"
                          }
                        >
                          {formatBankAccountStatus(account.active)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(account)}
                            className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                            aria-label="Editar cuenta"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id)}
                            className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Eliminar cuenta"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {creating && (
        <BankAccountModal
          onClose={() => setCreating(false)}
          onSaved={(account) => {
            setAccounts((prev) =>
              [...prev, account].sort((a, b) => a.code.localeCompare(b.code))
            );
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <BankAccountModal
          account={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setAccounts((prev) =>
              prev
                .map((account) => (account.id === updated.id ? updated : account))
                .sort((a, b) => a.code.localeCompare(b.code))
            );
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
