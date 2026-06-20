"use client";

import { useCallback, useEffect, useState } from "react";
import { IdCard, RefreshCw, Search } from "lucide-react";
import type { PadronClienteRecord } from "@/lib/clientes-padron-shared";
import { FichaClienteModal } from "./FichaClienteModal";

const FICHA_PREVIEW_HEADERS = ["Nombres", "Apellidos", "DNI o Pasaporte"] as const;

export function FichaClientesPanel() {
  const [clientes, setClientes] = useState<PadronClienteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fichaCliente, setFichaCliente] = useState<PadronClienteRecord | null>(
    null
  );

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
    } catch {
      setError("No se pudieron cargar las fichas de clientes.");
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

  return (
    <>
      <div className="card-glass overflow-hidden">
        <div className="border-b border-gold/15 px-4 py-4 sm:px-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IdCard size={20} className="text-gold" />
              <h2 className="font-display text-base font-semibold text-navy">
                Ficha de Clientes
              </h2>
            </div>
            <p className="font-ui text-xs uppercase tracking-label text-navy/50">
              {clientes.length} registro{clientes.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="input-field pl-9"
                aria-label="Buscar clientes"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchClientes(true)}
              disabled={refreshing}
              className="btn-outline flex-1 text-xs sm:flex-none"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-5">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-8 text-center font-body text-navy/60">Cargando...</p>
        ) : clientes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-body text-navy/60">
              No hay clientes en el padrón. Cargá clientes desde{" "}
              <strong>Padrón Clientes</strong> para ver sus fichas acá.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left font-body text-sm">
              <thead>
                <tr className="border-b border-gold/20 bg-cream/50">
                  {FICHA_PREVIEW_HEADERS.map((header) => (
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
                    <td className="px-3 py-2.5 text-navy">{cliente.nombres}</td>
                    <td className="px-3 py-2.5 text-navy">{cliente.apellidos}</td>
                    <td className="px-3 py-2.5 text-navy/80">
                      {cliente.documento || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setFichaCliente(cliente)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-ui text-xs uppercase tracking-label text-navy/60 transition-colors hover:bg-gold/10 hover:text-gold"
                        aria-label={`Ver ficha de ${cliente.nombres} ${cliente.apellidos}`}
                        title="Ficha"
                      >
                        <IdCard size={16} />
                        Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {fichaCliente && (
        <FichaClienteModal
          cliente={fichaCliente}
          onClose={() => setFichaCliente(null)}
          onSaved={() => {
            setFichaCliente(null);
            fetchClientes(true);
          }}
        />
      )}
    </>
  );
}
