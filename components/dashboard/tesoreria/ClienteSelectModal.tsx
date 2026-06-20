"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, User, X } from "lucide-react";
import { formatArs } from "@/lib/bank-statement-config";
import type { ClienteHistorialPago } from "@/lib/historial-pago";

interface ClienteSelectModalProps {
  selectedClient?: string | null;
  onClose: () => void;
  onSelect: (cliente: ClienteHistorialPago) => void;
}

export function ClienteSelectModal({
  selectedClient,
  onClose,
  onSelect,
}: ClienteSelectModalProps) {
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<ClienteHistorialPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(
        `/api/admin/historial-pago/clientes?${params.toString()}`
      );
      if (!res.ok) throw new Error("Error al cargar clientes");

      const data = await res.json();
      setClientes(data.clientes);
    } catch {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchClientes]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/50"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-gold/20 bg-warm-white shadow-xl sm:rounded-2xl">
        <div className="border-b border-gold/15 px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy">
              Seleccionar cliente
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

          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre y apellido..."
              className="input-field pl-9"
              autoFocus
              aria-label="Buscar clientes"
            />
          </div>
        </div>

        <div className="overflow-y-auto px-2 py-2">
          {error && (
            <p className="mx-3 my-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="p-6 text-center font-body text-sm text-navy/60">
              Buscando clientes...
            </p>
          ) : clientes.length === 0 ? (
            <p className="p-6 text-center font-body text-sm text-navy/60">
              No hay clientes con transferencias recibidas.
            </p>
          ) : (
            <ul className="space-y-1">
              {clientes.map((cliente) => {
                const isSelected =
                  selectedClient &&
                  selectedClient.toLowerCase() === cliente.name.toLowerCase();

                return (
                  <li key={cliente.name}>
                    <button
                      type="button"
                      onClick={() => onSelect(cliente)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-gold/10 ${
                        isSelected ? "bg-gold/15 ring-1 ring-gold/30" : ""
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy/60">
                        <User size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-body font-medium text-navy">
                          {cliente.name}
                        </span>
                        <span className="block font-body text-xs text-navy/55">
                          {cliente.transferCount}{" "}
                          {cliente.transferCount === 1
                            ? "transferencia"
                            : "transferencias"}{" "}
                          · {formatArs(cliente.totalImporte)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
