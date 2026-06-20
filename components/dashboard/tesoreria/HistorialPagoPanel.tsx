"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  Hash,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  formatArs,
  formatMovementDateTime,
} from "@/lib/bank-statement-shared";
import { HISTORIAL_PAGO_HEADERS } from "@/lib/historial-pago-shared";
import {
  downloadPdfTable,
  downloadXlsx,
  pdfFilename,
  xlsxFilename,
} from "@/lib/spreadsheet-export";
import { BankMovementModal } from "./BankMovementModal";
import { ClienteSelectModal } from "./ClienteSelectModal";
import { ConceptEditModal } from "./ConceptEditModal";
import type { BankMovementItem } from "./ExtractoBancoPanel";

function truncate(text: string, max = 40): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function movementExportRows(movements: BankMovementItem[]) {
  return movements.map((movement) => [
    formatMovementDateTime(movement.movementDate),
    movement.reference,
    movement.concept,
    formatArs(movement.amount),
    movement.runningBalance === null ? "" : formatArs(movement.runningBalance),
  ]);
}

export function HistorialPagoPanel() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [movements, setMovements] = useState<BankMovementItem[]>([]);
  const [totalImporte, setTotalImporte] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<BankMovementItem | null>(
    null
  );
  const [editingConcept, setEditingConcept] = useState<BankMovementItem | null>(
    null
  );

  const fetchMovements = useCallback(
    async (manual = false) => {
      if (!selectedClient) {
        setMovements([]);
        setTotalImporte(0);
        setSelectedIds([]);
        return;
      }

      if (manual) setRefreshing(true);
      else setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ client: selectedClient });
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/admin/historial-pago?${params.toString()}`);
        if (!res.ok) throw new Error("Error al cargar");

        const data = await res.json();
        setMovements(data.movements);
        setTotalImporte(data.totalImporte);
        setSelectedIds([]);
      } catch {
        setError("No se pudo cargar el historial de pagos.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedClient, search]
  );

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
    if (!confirm("¿Eliminar este movimiento del extracto?")) return;
    const res = await fetch(`/api/admin/extracto-banco/movements/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchMovements(true);
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
      fetchMovements(true);
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  async function handleExportExcel() {
    if (!selectedClient) return;

    await downloadXlsx(
      xlsxFilename(`historial-pago-${selectedClient}`),
      "Historial",
      HISTORIAL_PAGO_HEADERS,
      movements.map((movement) => [
        formatMovementDateTime(movement.movementDate),
        movement.reference,
        movement.concept,
        movement.amount,
        movement.runningBalance,
      ])
    );
    setExportOpen(false);
  }

  async function handleExportPdf() {
    if (!selectedClient) return;

    await downloadPdfTable(
      pdfFilename(`historial-pago-${selectedClient}`),
      `Historial de pago — ${selectedClient}`,
      HISTORIAL_PAGO_HEADERS,
      movementExportRows(movements)
    );
    setExportOpen(false);
  }

  return (
    <>
      <div className="card-glass overflow-hidden">
        <div className="border-b border-gold/15 px-4 py-4 sm:px-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-navy">
                Historial de pago
              </h2>
              {selectedClient && (
                <p className="mt-1 font-body text-sm text-navy/65">
                  Cliente: <span className="font-medium text-navy">{selectedClient}</span>
                </p>
              )}
            </div>
            {selectedClient && (
              <p className="font-display text-lg font-semibold text-navy">
                Total: {formatArs(totalImporte)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setClientModalOpen(true)}
                className="btn-primary text-xs"
              >
                <UserRound size={16} />
                Seleccionar cliente
              </button>

              {selectedClient && (
                <div className="relative min-w-[220px] flex-1 max-w-md">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar en el historial..."
                    className="input-field pl-9"
                    aria-label="Buscar en historial"
                  />
                </div>
              )}
            </div>

            {selectedClient && (
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
                <button
                  type="button"
                  onClick={() => fetchMovements(true)}
                  disabled={refreshing}
                  className="btn-outline flex-1 text-xs sm:flex-none"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportOpen((prev) => !prev)}
                    disabled={movements.length === 0}
                    className="btn-outline flex-1 text-xs sm:flex-none"
                  >
                    <FileDown size={16} />
                    Exportar
                  </button>
                  {exportOpen && movements.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setExportOpen(false)}
                        aria-label="Cerrar menú exportar"
                      />
                      <div className="absolute right-0 z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-gold/20 bg-warm-white shadow-lg">
                        <button
                          type="button"
                          onClick={handleExportExcel}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm text-navy/80 transition-colors hover:bg-gold/10 hover:text-gold"
                        >
                          <FileSpreadsheet size={16} />
                          Excel
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm text-navy/80 transition-colors hover:bg-gold/10 hover:text-gold"
                        >
                          <FileDown size={16} />
                          PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-5">
            {error}
          </p>
        )}

        {!selectedClient ? (
          <p className="p-8 text-center font-body text-navy/60">
            Seleccioná un cliente para ver su historial de transferencias recibidas.
          </p>
        ) : loading ? (
          <p className="p-8 text-center font-body text-navy/60">Cargando...</p>
        ) : movements.length === 0 ? (
          <p className="p-8 text-center font-body text-navy/60">
            No hay transferencias para {selectedClient}.
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
                    <td className="px-3 py-2.5 text-navy/80">
                      {movement.reference || "—"}
                    </td>
                    <td
                      className={`max-w-[280px] truncate px-3 py-2.5 ${
                        movement.conceptEdited
                          ? "rounded-md bg-sky-100 font-medium text-sky-800"
                          : "text-navy"
                      }`}
                      title={movement.concept}
                    >
                      {truncate(movement.concept)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-green-700">
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

      {clientModalOpen && (
        <ClienteSelectModal
          selectedClient={selectedClient}
          onClose={() => setClientModalOpen(false)}
          onSelect={(cliente) => {
            setSelectedClient(cliente.name);
            setSearch("");
            setClientModalOpen(false);
          }}
        />
      )}

      {editingMovement && (
        <BankMovementModal
          movement={editingMovement}
          onClose={() => setEditingMovement(null)}
          onSaved={() => {
            setEditingMovement(null);
            fetchMovements(true);
          }}
        />
      )}

      {editingConcept && (
        <ConceptEditModal
          movement={editingConcept}
          onClose={() => setEditingConcept(null)}
          onSaved={() => {
            setEditingConcept(null);
            fetchMovements(true);
          }}
        />
      )}
    </>
  );
}
