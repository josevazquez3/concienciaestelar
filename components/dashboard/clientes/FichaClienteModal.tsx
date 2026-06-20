"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, X } from "lucide-react";
import {
  formatBirthDate,
  PADRON_CLIENTES_HEADERS,
  padronExportRows,
  parseBirthDate,
  type PadronClienteRecord,
} from "@/lib/clientes-padron-shared";
import {
  downloadPdfTable,
  downloadXlsx,
  pdfFilename,
  xlsxFilename,
} from "@/lib/spreadsheet-export";

interface FichaClienteModalProps {
  cliente: PadronClienteRecord;
  onClose: () => void;
  onSaved: () => void;
}

function fichaExportBasename(cliente: PadronClienteRecord): string {
  const slug = `${cliente.nombres}-${cliente.apellidos}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `ficha-${slug}` : "ficha-cliente";
}

export function FichaClienteModal({
  cliente,
  onClose,
  onSaved,
}: FichaClienteModalProps) {
  const [nombres, setNombres] = useState(cliente.nombres);
  const [apellidos, setApellidos] = useState(cliente.apellidos);
  const [documento, setDocumento] = useState(cliente.documento);
  const [fechaNacimiento, setFechaNacimiento] = useState(
    cliente.fechaNacimiento
      ? formatBirthDate(new Date(cliente.fechaNacimiento))
      : ""
  );
  const [email, setEmail] = useState(cliente.email);
  const [celular, setCelular] = useState(cliente.celular);
  const [residencia, setResidencia] = useState(cliente.residencia);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  function buildExportRecord(): PadronClienteRecord {
    return {
      ...cliente,
      nombres,
      apellidos,
      documento,
      fechaNacimiento: fechaNacimiento.trim()
        ? parseBirthDate(fechaNacimiento)?.toISOString() ?? null
        : null,
      email,
      celular,
      residencia,
    };
  }

  async function handleExportExcel() {
    const record = buildExportRecord();
    await downloadXlsx(
      xlsxFilename(fichaExportBasename(record)),
      "Ficha Cliente",
      PADRON_CLIENTES_HEADERS,
      padronExportRows([record])
    );
    setExportOpen(false);
  }

  async function handleExportPdf() {
    const record = buildExportRecord();
    const title = `Ficha de ${record.nombres} ${record.apellidos}`.trim();
    await downloadPdfTable(
      pdfFilename(fichaExportBasename(record)),
      title,
      PADRON_CLIENTES_HEADERS,
      padronExportRows([record])
    );
    setExportOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    if (!nombres.trim() && !apellidos.trim()) {
      setError("Indicá al menos nombres o apellidos.");
      setSaving(false);
      return;
    }

    if (fechaNacimiento.trim() && !parseBirthDate(fechaNacimiento)) {
      setError("Fecha de nacimiento inválida (usá DD/MM/YYYY).");
      setSaving(false);
      return;
    }

    if (documento.trim() && !/^\d+$/.test(documento.trim())) {
      setError("DNI o Pasaporte debe contener solo números.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/clientes/padron/${cliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres,
          apellidos,
          documento,
          fechaNacimiento,
          email,
          celular,
          residencia,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      onSaved();
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
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">
              Ficha de cliente
            </h2>
            <p className="mt-1 font-body text-sm text-navy/60">
              Datos del Padrón de Clientes
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="section-label mb-2 block" htmlFor="fc-nombres">
              Nombres
            </label>
            <input
              id="fc-nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="input-field"
              maxLength={120}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="fc-apellidos">
              Apellidos
            </label>
            <input
              id="fc-apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="input-field"
              maxLength={120}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="fc-documento">
              DNI o Pasaporte
            </label>
            <input
              id="fc-documento"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={documento}
              onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ""))}
              className="input-field"
              maxLength={15}
              placeholder="Solo números"
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="fc-fecha">
              Fecha de Nacimiento
            </label>
            <input
              id="fc-fecha"
              type="text"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="input-field"
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="fc-email">
              Correo electrónico
            </label>
            <input
              id="fc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              maxLength={120}
            />
          </div>
          <div>
            <label className="section-label mb-2 block" htmlFor="fc-celular">
              Nº de Celular
            </label>
            <input
              id="fc-celular"
              type="text"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="input-field"
              maxLength={40}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="section-label mb-2 block" htmlFor="fc-residencia">
              Lugar de residencia
            </label>
            <input
              id="fc-residencia"
              type="text"
              value={residencia}
              onChange={(e) => setResidencia(e.target.value)}
              className="input-field"
              maxLength={200}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((prev) => !prev)}
              className="btn-outline w-full text-xs sm:w-auto"
            >
              <FileDown size={16} />
              Exportar
            </button>
            {exportOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setExportOpen(false)}
                  aria-label="Cerrar menú exportar"
                />
                <div className="absolute left-0 z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-gold/20 bg-warm-white shadow-lg sm:left-auto sm:right-0">
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

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline w-full sm:w-auto"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary w-full sm:w-auto"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
