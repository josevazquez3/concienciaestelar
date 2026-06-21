"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  Calendar,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PadronClienteModal } from "@/components/dashboard/clientes/PadronClienteModal";
import type { PadronClienteRecord } from "@/lib/clientes-padron-shared";
import {
  MESES_ES,
  type PagoDelMesRow,
} from "@/lib/pagos-del-mes-shared";
import { DEFAULT_WHATSAPP_MESSAGES } from "@/lib/whatsapp-shared";
import { BankMovementModal } from "./BankMovementModal";
import type { BankMovementItem } from "./ExtractoBancoPanel";
import { PagosDelMesWhatsAppModal } from "./PagosDelMesWhatsAppModal";

function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function PagosDelMesPanel() {
  const initial = currentMonthYear();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [allMonths, setAllMonths] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(initial.month);
  const [draftYear, setDraftYear] = useState(initial.year);

  const [rows, setRows] = useState<PagoDelMesRow[]>([]);
  const [pagosCount, setPagosCount] = useState(0);
  const [faltantesCount, setFaltantesCount] = useState(0);
  const [clientes, setClientes] = useState<PadronClienteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingCliente, setEditingCliente] = useState<PadronClienteRecord | null>(
    null
  );
  const [editingMovement, setEditingMovement] = useState<BankMovementItem | null>(
    null
  );
  const [whatsappTarget, setWhatsappTarget] = useState<{
    row: PagoDelMesRow;
    cliente: PadronClienteRecord;
  } | null>(null);
  const [pagosDelMesMessage, setPagosDelMesMessage] = useState(
    DEFAULT_WHATSAPP_MESSAGES.pagosDelMes
  );

  const periodLabel = useMemo(() => {
    if (allMonths) return "Todos los meses y años";
    return `${MESES_ES[month - 1]} ${year}`;
  }, [allMonths, month, year]);

  const fetchData = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      else setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
          allMonths: String(allMonths),
        });
        if (search.trim()) params.set("search", search.trim());

        const [pagosRes, padronRes, configRes] = await Promise.all([
          fetch(`/api/admin/pagos-del-mes?${params.toString()}`),
          fetch("/api/admin/clientes/padron"),
          fetch("/api/admin/configuracion"),
        ]);

        if (!pagosRes.ok) throw new Error("Error al cargar pagos");
        if (!padronRes.ok) throw new Error("Error al cargar padrón");
        if (!configRes.ok) throw new Error("Error al cargar configuración");

        const pagosData = await pagosRes.json();
        const padronData = await padronRes.json();
        const configData = await configRes.json();

        setRows(pagosData.rows);
        setPagosCount(pagosData.pagosCount);
        setFaltantesCount(pagosData.faltantesCount);
        setClientes(padronData.clientes);
        setPagosDelMesMessage(
          configData.whatsappMessages?.pagosDelMes ??
            DEFAULT_WHATSAPP_MESSAGES.pagosDelMes
        );
      } catch {
        setError("No se pudo cargar los pagos del mes.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [allMonths, month, search, year]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchData]);

  function openCalendar() {
    setDraftMonth(month);
    setDraftYear(year);
    setCalendarOpen(true);
  }

  function applyCalendar() {
    setMonth(draftMonth);
    setYear(draftYear);
    setAllMonths(false);
    setCalendarOpen(false);
  }

  async function handleDeleteMovement(movementId: string) {
    if (!confirm("¿Eliminar esta transferencia del extracto?")) return;

    const res = await fetch(`/api/admin/extracto-banco/movements/${movementId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchData(true);
    } else {
      const data = await res.json();
      alert(data.error ?? "No se pudo eliminar");
    }
  }

  async function openEditCliente(clienteId: string) {
    const cliente =
      clientes.find((item) => item.id === clienteId) ??
      (await fetch("/api/admin/clientes/padron")
        .then((res) => res.json())
        .then((data) =>
          (data.clientes as PadronClienteRecord[]).find(
            (item) => item.id === clienteId
          )
        ));

    if (cliente) setEditingCliente(cliente);
  }

  async function openEditMovement(movementId: string) {
    try {
      const res = await fetch("/api/admin/transferencias-recibidas");
      if (!res.ok) return;
      const data = await res.json();
      const movement = (data.movements as BankMovementItem[]).find(
        (item) => item.id === movementId
      );
      if (movement) setEditingMovement(movement);
    } catch {
      setError("No se pudo conectar con el servidor. ¿Está corriendo npm run dev?");
    }
  }

  function openWhatsApp(row: PagoDelMesRow) {
    const cliente = clientes.find((item) => item.id === row.clienteId);
    if (!cliente) return;
    setWhatsappTarget({ row, cliente });
  }

  function handleWhatsappSaved(updates: {
    celular: string;
    messageTemplate: string;
    cliente: PadronClienteRecord;
  }) {
    setPagosDelMesMessage(updates.messageTemplate);
    setClientes((prev) =>
      prev.map((item) =>
        item.id === updates.cliente.id ? updates.cliente : item
      )
    );
    setWhatsappTarget(null);
    fetchData(true);
  }

  return (
    <>
      <div className="card-glass overflow-hidden">
        <div className="border-b border-gold/15 px-4 py-4 sm:px-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-navy">
              Pagos del Mes
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Pagos: {pagosCount}
              </span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                Faltantes: {faltantesCount}
              </span>
            </div>
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
                placeholder="Buscar por nombre o mes..."
                className="input-field pl-9"
                aria-label="Buscar pagos"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openCalendar}
                disabled={allMonths}
                className="btn-outline text-xs"
              >
                <Calendar size={16} />
                Calendario
              </button>

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gold/20 bg-white/60 px-3 py-2 font-body text-xs text-navy/80">
                <input
                  type="checkbox"
                  checked={allMonths}
                  onChange={(e) => setAllMonths(e.target.checked)}
                  className="rounded border-gold/30"
                />
                Buscar todos los meses y años
              </label>

              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="btn-outline text-xs"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
          </div>

          <p className="mt-3 font-body text-sm text-navy/60">
            Período: <span className="font-medium text-navy">{periodLabel}</span>
          </p>
        </div>

        {error && (
          <p className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-5">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-8 text-center font-body text-navy/60">Cargando...</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center font-body text-navy/60">
            No hay clientes en el padrón para mostrar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left font-body text-sm">
              <thead>
                <tr className="border-b border-gold/20 bg-cream/50">
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Nombres
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Apellidos
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Mes
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Pgo
                  </th>
                  <th className="px-3 py-3 font-ui text-xs uppercase tracking-label text-navy/60">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const missing = !row.pago;
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-gold/10 transition-colors last:border-0 ${
                        missing
                          ? "bg-red-50/80 hover:bg-red-50"
                          : index % 2 === 0
                            ? "bg-white/40 hover:bg-sky-50/60"
                            : "bg-cream/20 hover:bg-sky-50/60"
                      }`}
                    >
                      <td
                        className={`px-3 py-2.5 ${
                          missing ? "font-medium text-red-700" : "text-navy"
                        }`}
                      >
                        {row.nombres || "—"}
                      </td>
                      <td
                        className={`px-3 py-2.5 ${
                          missing ? "font-medium text-red-700" : "text-navy"
                        }`}
                      >
                        {row.apellidos || "—"}
                      </td>
                      <td
                        className={`px-3 py-2.5 font-medium ${
                          missing ? "text-red-700" : "text-navy/80"
                        }`}
                      >
                        {row.mes}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.pago
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {row.pago ? "SI" : "NO"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openWhatsApp(row)}
                            className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50"
                            aria-label={`WhatsApp ${row.nombres} ${row.apellidos}`}
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditCliente(row.clienteId)}
                            className="rounded-lg p-1.5 text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                            aria-label={`Editar ${row.nombres} ${row.apellidos}`}
                            title="Editar cliente"
                          >
                            <Pencil size={16} />
                          </button>
                          {row.movementId ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditMovement(row.movementId!)}
                                className="rounded-lg p-1.5 text-sky-600 transition-colors hover:bg-sky-50"
                                aria-label="Editar transferencia"
                                title="Editar transferencia"
                              >
                                <ArrowDownLeft size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMovement(row.movementId!)
                                }
                                className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
                                aria-label="Eliminar transferencia"
                                title="Eliminar transferencia"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-lg p-1.5 text-navy/20"
                              aria-label="Sin transferencia para eliminar"
                              title="Sin transferencia"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {calendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div
            className="card-glass w-full max-w-sm p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                id="calendar-title"
                className="font-display text-lg font-semibold text-navy"
              >
                Seleccionar mes
              </h3>
              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="rounded-lg p-1 text-navy/60 hover:bg-gold/10"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-body text-sm text-navy/70">
                  Mes
                </label>
                <select
                  value={draftMonth}
                  onChange={(e) => setDraftMonth(Number(e.target.value))}
                  className="input-field w-full"
                >
                  {MESES_ES.map((label, index) => (
                    <option key={label} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-body text-sm text-navy/70">
                  Año
                </label>
                <select
                  value={draftYear}
                  onChange={(e) => setDraftYear(Number(e.target.value))}
                  className="input-field w-full"
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const baseYear = new Date().getFullYear();
                    return baseYear - 5 + i;
                  }).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCalendarOpen(false)}
                  className="btn-outline text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={applyCalendar}
                  className="btn-primary text-sm"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCliente && (
        <PadronClienteModal
          cliente={editingCliente}
          onClose={() => setEditingCliente(null)}
          onSaved={() => {
            setEditingCliente(null);
            fetchData(true);
          }}
        />
      )}

      {editingMovement && (
        <BankMovementModal
          movement={editingMovement}
          onClose={() => setEditingMovement(null)}
          onSaved={() => {
            setEditingMovement(null);
            fetchData(true);
          }}
        />
      )}

      {whatsappTarget && (
        <PagosDelMesWhatsAppModal
          row={whatsappTarget.row}
          cliente={whatsappTarget.cliente}
          messageTemplate={pagosDelMesMessage}
          onClose={() => setWhatsappTarget(null)}
          onSaved={handleWhatsappSaved}
        />
      )}
    </>
  );
}
