"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FolderInput,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  formatBirthDate,
  PADRON_CLIENTES_HEADERS,
  padronExportRows,
  type PadronClienteRecord,
} from "@/lib/clientes-padron-shared";
import {
  downloadPdfTable,
  downloadXlsx,
  pdfFilename,
  xlsxFilename,
} from "@/lib/spreadsheet-export";
import { readSpreadsheetAsCsv, SPREADSHEET_ACCEPT } from "@/lib/spreadsheet-import";
import { PadronClienteModal } from "./PadronClienteModal";

export function PadronClientesPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientes, setClientes] = useState<PadronClienteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [clienteModal, setClienteModal] = useState<
    PadronClienteRecord | "create" | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchClientes = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/clientes/padron?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar");

      const data = await res.json();
      setClientes(data.clientes);
      setSelectedIds([]);
    } catch {
      setError("No se pudo cargar el padrón de clientes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchClientes]);

  const allSelected = useMemo(
    () => clientes.length > 0 && selectedIds.length === clientes.length,
    [clientes.length, selectedIds.length]
  );

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(clientes.map((cliente) => cliente.id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    setImportMessage("");
    setError("");

    try {
      const text = await readSpreadsheetAsCsv(file);
      const res = await fetch("/api/admin/clientes/padron", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al importar");
      }

      setClientes(data.clientes);

      const parts: string[] = [];
      if (data.created > 0) parts.push(`${data.created} nuevo(s)`);
      if (data.updated > 0) parts.push(`${data.updated} actualizado(s)`);

      let message = `Importación completada: ${parts.join(", ") || data.imported}.`;
      if (data.mappedColumns?.length) {
        message += ` Columnas usadas: ${data.mappedColumns.join(", ")}.`;
      }
      if (data.warnings?.length) {
        message += ` ${data.warnings.join(" ")}`;
      }

      setImportMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleExportExcel() {
    await downloadXlsx(
      xlsxFilename("padron-clientes"),
      "Padrón Clientes",
      PADRON_CLIENTES_HEADERS,
      padronExportRows(clientes)
    );
    setExportOpen(false);
  }

  async function handleExportPdf() {
    await downloadPdfTable(
      pdfFilename("padron-clientes"),
      "Padrón de Clientes",
      PADRON_CLIENTES_HEADERS,
      padronExportRows(clientes)
    );
    setExportOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente del padrón?")) return;

    const res = await fetch(`/api/admin/clientes/padron/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchClientes(true);
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `¿Eliminar ${selectedIds.length} cliente${selectedIds.length === 1 ? "" : "s"} del padrón?`
      )
    ) {
      return;
    }

    const res = await fetch("/api/admin/clientes/padron", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (res.ok) {
      fetchClientes(true);
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  return (
    <>
    <div className="card-glass overflow-hidden">
      <div className="border-b border-gold/15 px-4 py-4 sm:px-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gold" />
            <h2 className="font-display text-base font-semibold text-navy">
              Padrón de Clientes
            </h2>
          </div>
          <p className="font-ui text-xs uppercase tracking-label text-navy/50">
            {clientes.length} registro{clientes.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, documento, email..."
              className="input-field pl-9"
              aria-label="Buscar clientes"
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
            <button
              type="button"
              onClick={() => setClienteModal("create")}
              className="btn-outline flex-1 text-xs sm:flex-none"
            >
              <UserPlus size={16} />
              Carga manual
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={SPREADSHEET_ACCEPT}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImportFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="btn-outline flex-1 text-xs sm:flex-none"
              title="Importar Excel o CSV. Solo se usan las columnas del padrón."
            >
              <FolderInput size={16} />
              {importing ? "Importando..." : "Importar Excel"}
            </button>
            <button
              type="button"
              onClick={() => fetchClientes(true)}
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
                disabled={clientes.length === 0}
                className="btn-outline flex-1 text-xs sm:flex-none"
              >
                <FileDown size={16} />
                Exportar
              </button>
              {exportOpen && clientes.length > 0 && (
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
        </div>
      </div>

      {error && (
        <p className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-5">
          {error}
        </p>
      )}

      {importMessage && (
        <p className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 sm:mx-5">
          {importMessage}
        </p>
      )}

      {loading ? (
        <p className="p-8 text-center font-body text-navy/60">Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-body text-navy/60">
            No hay clientes en el padrón. Importá un archivo Excel o CSV con las
            columnas: Nombres, Apellidos, DNI o Pasaporte, Fecha de Nacimiento,
            Correo electrónico, Nº de Celular y Lugar de residencia.
          </p>
          <p className="mt-2 font-ui text-xs uppercase tracking-label text-gold">
            El importador detecta columnas automáticamente e ignora el resto
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left font-body text-sm">
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
                {PADRON_CLIENTES_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente, index) => (
                <tr
                  key={cliente.id}
                  className={`border-b border-gold/10 transition-colors last:border-0 hover:bg-sky-50/60 ${
                    index % 2 === 0 ? "bg-white/40" : "bg-cream/20"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(cliente.id)}
                      onChange={() => toggleSelect(cliente.id)}
                      aria-label={`Seleccionar ${cliente.nombres} ${cliente.apellidos}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-navy">{cliente.nombres}</td>
                  <td className="px-3 py-2.5 text-navy">{cliente.apellidos}</td>
                  <td className="px-3 py-2.5 text-navy/80">
                    {cliente.documento || "—"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-navy/80">
                    {cliente.fechaNacimiento
                      ? formatBirthDate(new Date(cliente.fechaNacimiento))
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-navy/80">
                    {cliente.email || "—"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-navy/80">
                    {cliente.celular || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-navy/80">
                    {cliente.residencia || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setClienteModal(cliente)}
                        className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                        aria-label="Editar cliente"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cliente.id)}
                        className="rounded-lg p-2 text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar cliente"
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

      {clienteModal && (
        <PadronClienteModal
          cliente={clienteModal === "create" ? null : clienteModal}
          onClose={() => setClienteModal(null)}
          onSaved={() => {
            setClienteModal(null);
            fetchClientes(true);
          }}
        />
      )}
    </>
  );
}
