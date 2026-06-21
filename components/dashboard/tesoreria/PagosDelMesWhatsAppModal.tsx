"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, X } from "lucide-react";
import { formatBirthDate } from "@/lib/clientes-padron-shared";
import type { PadronClienteRecord } from "@/lib/clientes-padron-shared";
import type { PagoDelMesRow } from "@/lib/pagos-del-mes-shared";
import {
  applyPagosDelMesMessageTemplate,
  DEFAULT_WHATSAPP_MESSAGES,
  formatWhatsAppDisplay,
  isValidWhatsAppMessage,
  MAX_WHATSAPP_MESSAGE_LENGTH,
  normalizeClienteCelularForWhatsApp,
  WHATSAPP_MESSAGE_META,
  whatsappHref,
} from "@/lib/whatsapp-shared";

interface PagosDelMesWhatsAppModalProps {
  row: PagoDelMesRow;
  cliente: PadronClienteRecord;
  messageTemplate: string;
  onClose: () => void;
  onSaved: (updates: {
    celular: string;
    messageTemplate: string;
    cliente: PadronClienteRecord;
  }) => void;
}

export function PagosDelMesWhatsAppModal({
  row,
  cliente,
  messageTemplate,
  onClose,
  onSaved,
}: PagosDelMesWhatsAppModalProps) {
  const [celular, setCelular] = useState(cliente.celular);
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCelular(cliente.celular);
    setMensaje(messageTemplate);
  }, [cliente.celular, messageTemplate]);

  const mensajeEnviar = applyPagosDelMesMessageTemplate(mensaje, {
    nombres: row.nombres,
    apellidos: row.apellidos,
    mes: row.mes,
  });

  const whatsappDigits = normalizeClienteCelularForWhatsApp(celular);
  const whatsappLink =
    whatsappDigits && mensajeEnviar.trim()
      ? whatsappHref(whatsappDigits, mensajeEnviar)
      : "";

  async function persistChanges(): Promise<boolean> {
    setSaving(true);
    setError("");

    if (!isValidWhatsAppMessage(mensaje)) {
      setError("El mensaje debe tener entre 1 y 500 caracteres.");
      setSaving(false);
      return false;
    }

    if (!celular.trim()) {
      setError("Indicá un número de celular.");
      setSaving(false);
      return false;
    }

    try {
      const fechaNacimiento = cliente.fechaNacimiento
        ? formatBirthDate(new Date(cliente.fechaNacimiento))
        : "";

      const padronRes = await fetch(`/api/admin/clientes/padron/${cliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          documento: cliente.documento,
          fechaNacimiento,
          email: cliente.email,
          celular,
          residencia: cliente.residencia,
        }),
      });

      if (!padronRes.ok) {
        const data = await padronRes.json();
        throw new Error(data.error ?? "No se pudo guardar el teléfono");
      }

      const updatedCliente = (await padronRes.json()) as PadronClienteRecord;

      const configRes = await fetch("/api/admin/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappMessages: { pagosDelMes: mensaje.trim() },
        }),
      });

      if (!configRes.ok) {
        const data = await configRes.json();
        throw new Error(data.error ?? "No se pudo guardar el mensaje");
      }

      onSaved({
        celular,
        messageTemplate: mensaje,
        cliente: updatedCliente,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    const ok = await persistChanges();
    if (ok) onClose();
  }

  async function handleOpenWhatsApp() {
    if (!whatsappLink) {
      setError("Completá teléfono y mensaje para abrir WhatsApp.");
      return;
    }

    const ok = await persistChanges();
    if (!ok) return;

    window.open(whatsappLink, "_blank", "noopener,noreferrer");
    onClose();
  }

  const meta = WHATSAPP_MESSAGE_META.pagosDelMes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <div
        className="card-glass max-h-[90vh] w-full max-w-lg overflow-y-auto p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pagos-whatsapp-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3
                id="pagos-whatsapp-title"
                className="font-display text-lg font-semibold text-navy"
              >
                WhatsApp — {row.nombres} {row.apellidos}
              </h3>
              <p className="font-body text-sm text-navy/60">
                Mes: {row.mes} · Los cambios se guardan en el padrón y en
                configuración.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-navy/60 hover:bg-gold/10"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="section-label mb-2 block"
              htmlFor="pagos-whatsapp-celular"
            >
              Celular (padrón de clientes)
            </label>
            <input
              id="pagos-whatsapp-celular"
              type="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="input-field"
              placeholder="+5492216014212"
            />
            {whatsappDigits ? (
              <p className="mt-2 font-body text-xs text-navy/50">
                Se enviará a: {formatWhatsAppDisplay(whatsappDigits)}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="section-label mb-2 block"
              htmlFor="pagos-whatsapp-mensaje"
            >
              Mensaje
            </label>
            <textarea
              id="pagos-whatsapp-mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={5}
              maxLength={MAX_WHATSAPP_MESSAGE_LENGTH}
              className="input-field min-h-[120px] resize-y"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-body text-xs text-navy/50">{meta.hint}</p>
              <p className="font-ui text-xs text-navy/40">
                {mensaje.length}/{MAX_WHATSAPP_MESSAGE_LENGTH}
              </p>
            </div>
            {mensajeEnviar && (
              <div className="mt-3 rounded-xl border border-gold/20 bg-cream/50 p-3">
                <p className="section-label mb-1">Vista previa para este cliente</p>
                <p className="whitespace-pre-line font-body text-sm text-navy/80">
                  {mensajeEnviar}
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-gold/15 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-sm"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-outline text-sm"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="btn-primary inline-flex items-center justify-center gap-2 text-sm"
              disabled={saving || !whatsappLink}
            >
              <ExternalLink size={16} />
              Abrir WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
