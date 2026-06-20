"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { formatAmountForInput } from "@/lib/bank-statement-config";

type MovementDuplicateReason = "existing" | "file";

export type PdfPreviewMovement = {
  fecha: string;
  descripcion: string;
  ideOperacion: string;
  valor: number;
  saldo: number;
  movementDate: string;
  valorFormatted: string;
  saldoFormatted: string;
  isDuplicate: boolean;
  duplicateReason?: MovementDuplicateReason;
};

export type PdfPreviewData = {
  fileName: string;
  periodo: string | null;
  saldoInicial: number | null;
  saldoFinal: number | null;
  saldoInicialFormatted: string | null;
  saldoFinalFormatted: string | null;
  duplicateCount?: number;
  newCount?: number;
  movements: PdfPreviewMovement[];
};

interface PdfImportPreviewModalProps {
  preview: PdfPreviewData;
  onClose: () => void;
  onImported: (message: string) => void;
}

function duplicateLabel(reason?: MovementDuplicateReason): string {
  if (reason === "existing") return "Ya importado";
  if (reason === "file") return "Duplicado en PDF";
  return "Duplicado";
}

export function PdfImportPreviewModal({
  preview,
  onClose,
  onImported,
}: PdfImportPreviewModalProps) {
  const [updateInitialBalance, setUpdateInitialBalance] = useState(
    preview.saldoInicial !== null
  );
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const newMovements = useMemo(
    () => preview.movements.filter((movement) => !movement.isDuplicate),
    [preview.movements]
  );

  const duplicateCount =
    preview.duplicateCount ??
    preview.movements.filter((movement) => movement.isDuplicate).length;

  const newCount = preview.newCount ?? newMovements.length;

  async function handleConfirm() {
    if (newMovements.length === 0) {
      setError("Todos los movimientos del PDF ya están importados.");
      return;
    }

    setImporting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/extracto-banco/movements/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movements: newMovements.map((movement) => ({
            movementDate: movement.movementDate,
            concept: movement.descripcion,
            reference: movement.ideOperacion,
            operationCode: movement.ideOperacion.slice(-4),
            amount: movement.valor,
            runningBalance: movement.saldo,
          })),
          updateInitialBalance:
            updateInitialBalance && preview.saldoInicial !== null,
          initialBalance: preview.saldoInicial,
          initialBalanceDate: [...newMovements]
            .sort(
              (a, b) =>
                new Date(a.movementDate).getTime() -
                new Date(b.movementDate).getTime()
            )[0]?.movementDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");

      const balanceNote =
        updateInitialBalance && preview.saldoInicialFormatted
          ? ` Saldo inicial actualizado a ${preview.saldoInicialFormatted}.`
          : "";

      const skippedNote =
        data.skipped > 0 ? ` ${data.skipped} duplicado(s) omitido(s).` : "";

      const duplicateNote =
        duplicateCount > 0
          ? ` ${duplicateCount} duplicado(s) detectado(s) en la vista previa.`
          : "";

      onImported(
        `${data.imported} movimiento(s) importados desde ${preview.fileName}.${duplicateNote}${skippedNote}${balanceNote}`
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setImporting(false);
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
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col rounded-t-2xl border border-gold/20 bg-warm-white shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-gold/15 p-5">
          <div className="min-w-0 pr-4">
            <h2 className="font-display text-lg font-semibold text-navy">
              Vista previa del extracto PDF
            </h2>
            <p className="mt-1 break-words font-body text-sm text-navy/60">
              {preview.fileName}
              {preview.periodo ? ` · ${preview.periodo}` : ""}
            </p>
            <p className="mt-1 font-body text-sm text-navy/70">
              {preview.movements.length} movimiento(s) detectados ·{" "}
              <span className="text-green-700">{newCount} nuevo(s)</span>
              {duplicateCount > 0 && (
                <>
                  {" "}
                  · <span className="text-amber-700">{duplicateCount} duplicado(s)</span>
                </>
              )}
              {preview.saldoInicialFormatted
                ? ` · Saldo inicial del PDF: ${preview.saldoInicialFormatted}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-navy/50 hover:bg-navy/5"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {duplicateCount > 0 && (
          <p className="border-b border-amber-200 bg-amber-50 px-5 py-3 font-body text-sm text-amber-900">
            Los movimientos marcados como duplicados no se importarán. Se
            comparan por el ID de la operación.
          </p>
        )}

        {preview.saldoInicial !== null && (
          <label className="flex items-center gap-2 border-b border-gold/10 px-5 py-3 font-body text-sm text-navy/80">
            <input
              type="checkbox"
              checked={updateInitialBalance}
              onChange={(e) => setUpdateInitialBalance(e.target.checked)}
              className="h-4 w-4 rounded border-gold/40 text-gold focus:ring-gold/30"
            />
            Actualizar saldo inicial con el del PDF (
            {preview.saldoInicialFormatted ?? formatAmountForInput(preview.saldoInicial)})
          </label>
        )}

        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <table className="w-full min-w-[860px] text-left font-body text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-cream/50">
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Fecha
                </th>
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Descripción
                </th>
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Ide de la operación
                </th>
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Valor
                </th>
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Saldo
                </th>
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {preview.movements.map((movement, index) => (
                <tr
                  key={`${movement.ideOperacion}-${index}`}
                  className={`border-b border-gold/10 last:border-0 ${
                    movement.isDuplicate
                      ? "bg-amber-50/80"
                      : index % 2 === 0
                        ? "bg-white/50"
                        : "bg-cream/20"
                  }`}
                >
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 ${
                      movement.isDuplicate ? "text-navy/50 line-through" : "text-navy"
                    }`}
                  >
                    {movement.fecha}
                  </td>
                  <td
                    className={`max-w-[280px] px-3 py-2.5 ${
                      movement.isDuplicate ? "text-navy/50 line-through" : "text-navy"
                    }`}
                  >
                    {movement.descripcion}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 font-mono text-xs ${
                      movement.isDuplicate ? "text-navy/40 line-through" : "text-navy/80"
                    }`}
                  >
                    {movement.ideOperacion}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 font-medium ${
                      movement.isDuplicate
                        ? "text-navy/40 line-through"
                        : movement.valor >= 0
                          ? "text-green-700"
                          : "text-red-600"
                    }`}
                  >
                    {movement.valorFormatted}
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 ${
                      movement.isDuplicate
                        ? "text-navy/40 line-through"
                        : "text-navy/80"
                    }`}
                  >
                    {movement.saldoFormatted}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {movement.isDuplicate ? (
                      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                        {duplicateLabel(movement.duplicateReason)}
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                        Nuevo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="mx-5 mb-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-gold/15 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-outline w-full sm:w-auto">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={importing || newCount === 0}
            className="btn-primary w-full disabled:opacity-70 sm:w-auto"
          >
            {importing
              ? "Importando..."
              : newCount === 0
                ? "Sin movimientos nuevos"
                : `Confirmar importación (${newCount} nuevo${newCount === 1 ? "" : "s"})`}
          </button>
        </div>
      </div>
    </div>
  );
}
