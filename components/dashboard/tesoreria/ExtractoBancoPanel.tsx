"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileSpreadsheet,
  FolderInput,
  Hash,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import {
  formatArs,
  formatMovementDateTime,
  formatStatementDate,
} from "@/lib/bank-statement-config";
import { MOVEMENT_CSV_HEADERS } from "@/lib/bank-movements";
import { downloadXlsx, xlsxFilename } from "@/lib/spreadsheet-export";
import { readSpreadsheetAsCsv, EXTRACTO_IMPORT_ACCEPT } from "@/lib/spreadsheet-import";
import { BankMovementModal } from "./BankMovementModal";
import { InitialBalanceModal } from "./InitialBalanceModal";
import { ConceptEditModal } from "./ConceptEditModal";
import {
  PdfImportPreviewModal,
  type PdfPreviewData,
} from "./PdfImportPreviewModal";

export type BankMovementItem = {
  id: string;
  movementDate: string;
  branchCode: string;
  branchDescription: string;
  operationCode: string;
  reference: string;
  concept: string;
  conceptEdited: boolean;
  amount: number;
  runningBalance: number | null;
};

type StatementConfig = {
  initialBalance: number;
  initialBalanceDate: string;
};

function truncate(text: string, max = 28): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export function ExtractoBancoPanel() {
  const [config, setConfig] = useState<StatementConfig | null>(null);
  const [movements, setMovements] = useState<BankMovementItem[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [configMessage, setConfigMessage] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);
  const [editingMovement, setEditingMovement] = useState<BankMovementItem | null>(
    null
  );
  const [editingConcept, setEditingConcept] = useState<BankMovementItem | null>(
    null
  );
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultConfig = (): StatementConfig => ({
    initialBalance: 0,
    initialBalanceDate: new Date().toISOString(),
  });

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/extracto-banco/config");
      if (!res.ok) throw new Error("Error al cargar configuración");
      const data = await res.json();
      setConfig(data);
    } catch {
      setConfig(defaultConfig());
    }
  }, []);

  const openBalanceEditor = () => {
    setConfigMessage("");
    setEditingConfig(true);
  };

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(
        `/api/admin/extracto-banco/movements?${params.toString()}`
      );
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setConfig(data.config);
      setMovements(data.movements);
      setTotalBalance(data.totalBalance);
      setSelectedIds([]);
    } catch {
      setError("No se pudieron cargar los movimientos.");
    } finally {
      setLoading(false);
    }
  }, [search, fromDate, toDate]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovements();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMovements]);

  const allSelected = useMemo(
    () => movements.length > 0 && selectedIds.length === movements.length,
    [movements.length, selectedIds.length]
  );

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(movements.map((movement) => movement.id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    const res = await fetch(`/api/admin/extracto-banco/movements/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchMovements();
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.length} movimiento(s)?`)) return;

    const res = await fetch("/api/admin/extracto-banco/movements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (res.ok) {
      fetchMovements();
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  async function handleExport() {
    await downloadXlsx(
      xlsxFilename("extracto-banco"),
      "Extracto",
      MOVEMENT_CSV_HEADERS,
      movements.map((movement) => [
        formatMovementDateTime(movement.movementDate),
        movement.branchCode,
        movement.branchDescription,
        movement.operationCode,
        movement.reference,
        movement.concept,
        movement.amount,
        movement.runningBalance,
      ])
    );
  }

  async function handleImportPdf(file: File) {
    setImporting(true);
    setImportMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/extracto-banco/parse-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al leer el PDF");
      setPdfPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar PDF");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImportFile(file: File) {
    if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
      await handleImportPdf(file);
      return;
    }

    setImporting(true);
    setImportMessage("");
    setError("");
    try {
      const text = await readSpreadsheetAsCsv(file);
      const res = await fetch("/api/admin/extracto-banco/movements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");
      setImportMessage(`${data.imported} movimiento(s) importados.`);
      fetchMovements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading && !config) {
    return <p className="font-body text-navy/60">Cargando extracto...</p>;
  }

  const statementConfig = config ?? defaultConfig();

  return (
    <>
      <div className="card-glass overflow-hidden">
        <div className="border-b border-gold/15 px-4 py-4 sm:px-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base font-semibold text-navy">
              Movimientos
            </h2>
            <button
              type="button"
              onClick={openBalanceEditor}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-white/50 px-3 py-1.5 font-body text-sm text-navy/80 transition-colors hover:border-gold/50 hover:bg-gold/10 hover:text-gold"
              title="Editar saldo inicial"
            >
              Saldo Inicial: {formatArs(statementConfig.initialBalance)} al{" "}
              {formatStatementDate(statementConfig.initialBalanceDate)}
              <Pencil size={14} className="shrink-0 text-gold" />
            </button>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="input-field pl-9"
                  aria-label="Buscar movimientos"
                />
              </div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input-field"
                aria-label="Desde"
                title="Desde"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="input-field"
                aria-label="Hasta"
                title="Hasta"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="btn-outline text-xs text-red-600"
                >
                  <Trash2 size={16} />
                  Eliminar ({selectedIds.length})
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={EXTRACTO_IMPORT_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                }}
              />
              <button
                type="button"
                onClick={handleExport}
                disabled={movements.length === 0}
                className="btn-outline flex-1 text-xs sm:flex-none"
              >
                <FileSpreadsheet size={16} />
                Exportar Excel
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="btn-primary flex-1 text-xs sm:flex-none"
                title="Importar CSV, Excel o PDF"
              >
                <FolderInput size={16} />
                {importing ? "Importando..." : "Importar"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-gold/15 bg-cream/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <button
            type="button"
            onClick={openBalanceEditor}
            className="inline-flex items-center gap-1.5 text-left font-body text-sm text-navy/70 transition-colors hover:text-gold"
            title="Editar saldo inicial"
          >
            Saldo Inicial: {formatArs(statementConfig.initialBalance)} al{" "}
            {formatStatementDate(statementConfig.initialBalanceDate)}
            <Pencil size={14} className="shrink-0" />
          </button>
          <p className="font-display text-lg font-semibold text-navy">
            Saldo Total: {formatArs(totalBalance)}
          </p>
        </div>

        {configMessage && (
          <p className="mx-4 mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 sm:mx-5">
            {configMessage}
          </p>
        )}

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

        {loading ? (
          <p className="p-8 text-center font-body text-navy/60">Actualizando...</p>
        ) : movements.length === 0 ? (
          <p className="p-8 text-center font-body text-navy/60">
            No hay movimientos. Importá un extracto o ajustá los filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left font-body text-sm">
              <thead>
                <tr className="border-b border-gold/20 bg-cream/50">
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Fecha
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Referencia
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Concepto
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Importe
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Saldo
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, index) => (
                  <tr
                    key={movement.id}
                    className={`border-b border-gold/10 transition-colors last:border-0 hover:bg-sky-50/60 ${
                      index % 2 === 0 ? "bg-white/40" : "bg-cream/20"
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(movement.id)}
                        onChange={() => toggleSelect(movement.id)}
                        aria-label={`Seleccionar movimiento ${movement.reference}`}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-navy/80">
                      {formatMovementDateTime(movement.movementDate)}
                    </td>
                    <td className="px-3 py-2.5 text-navy/80">{movement.reference || "—"}</td>
                    <td
                      className={`max-w-[280px] truncate px-3 py-2.5 ${
                        movement.conceptEdited
                          ? "rounded-md bg-sky-100 font-medium text-sky-800"
                          : "text-navy"
                      }`}
                      title={movement.concept}
                    >
                      {truncate(movement.concept, 40)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2.5 font-medium ${
                        movement.amount >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatArs(movement.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-navy/80">
                      {movement.runningBalance === null
                        ? "—"
                        : formatArs(movement.runningBalance)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingMovement(movement)}
                          className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                          aria-label="Editar movimiento"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingConcept(movement)}
                          className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                          aria-label="Editar concepto"
                          title="Editar concepto"
                        >
                          <Hash size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(movement.id)}
                          className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar movimiento"
                          title="Eliminar"
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
        )}
      </div>

      {pdfPreview && (
        <PdfImportPreviewModal
          preview={pdfPreview}
          onClose={() => setPdfPreview(null)}
          onImported={(message) => {
            setImportMessage(message);
            setPdfPreview(null);
            fetchConfig();
            fetchMovements();
          }}
        />
      )}

      {editingConfig && (
        <InitialBalanceModal
          initialBalance={statementConfig.initialBalance}
          initialBalanceDate={statementConfig.initialBalanceDate}
          onClose={() => setEditingConfig(false)}
          onSaved={(saved) => {
            setConfig(saved);
            setEditingConfig(false);
            setConfigMessage(
              `Saldo inicial guardado: ${formatArs(saved.initialBalance)} al ${formatStatementDate(saved.initialBalanceDate)}.`
            );
            fetchMovements();
          }}
        />
      )}

      {editingMovement && (
        <BankMovementModal
          movement={editingMovement}
          onClose={() => setEditingMovement(null)}
          onSaved={() => {
            setEditingMovement(null);
            fetchMovements();
          }}
        />
      )}

      {editingConcept && (
        <ConceptEditModal
          movement={editingConcept}
          onClose={() => setEditingConcept(null)}
          onSaved={() => {
            setEditingConcept(null);
            fetchMovements();
          }}
        />
      )}
    </>
  );
}
