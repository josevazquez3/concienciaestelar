"use client";

import { useEffect, useState } from "react";
import { Building2, ExternalLink, MessageCircle } from "lucide-react";
import {
  DEFAULT_PAYMENT_DETAILS,
  formatPaymentDetailsForWhatsApp,
  hasPaymentDetails,
  PAYMENT_FIELD_META,
  appendPaymentDetailsToMessage,
  type PaymentDetailKey,
  type PaymentDetails,
} from "@/lib/payment-settings-shared";
import {
  DEFAULT_WHATSAPP_MESSAGES,
  formatWhatsAppDisplay,
  MAX_WHATSAPP_MESSAGE_LENGTH,
  WHATSAPP_MESSAGE_META,
  whatsappHref,
  type WhatsAppMessageKey,
} from "@/lib/whatsapp-shared";

const MESSAGE_KEYS = Object.keys(
  WHATSAPP_MESSAGE_META
) as WhatsAppMessageKey[];

const PAYMENT_KEYS = Object.keys(
  PAYMENT_FIELD_META
) as PaymentDetailKey[];

export function ConfiguracionPanel() {
  const [number, setNumber] = useState("");
  const [messages, setMessages] = useState(DEFAULT_WHATSAPP_MESSAGES);
  const [paymentDetails, setPaymentDetails] = useState(DEFAULT_PAYMENT_DETAILS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/configuracion");
        if (!res.ok) throw new Error("Error al cargar");
        const data = await res.json();
        setNumber(data.whatsappDisplay ?? "");
        setMessages({ ...DEFAULT_WHATSAPP_MESSAGES, ...data.whatsappMessages });
        setPaymentDetails({
          ...DEFAULT_PAYMENT_DETAILS,
          ...data.paymentDetails,
        });
      } catch {
        setError("No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: number,
          whatsappMessages: messages,
          paymentDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error al guardar");
      }

      setNumber(data.whatsappDisplay);
      setMessages({ ...DEFAULT_WHATSAPP_MESSAGES, ...data.whatsappMessages });
      setPaymentDetails({
        ...DEFAULT_PAYMENT_DETAILS,
        ...data.paymentDetails,
      });
      setSuccess("Configuración guardada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function updateMessage(key: WhatsAppMessageKey, value: string) {
    setMessages((prev) => ({ ...prev, [key]: value }));
  }

  function updatePaymentDetail(key: PaymentDetailKey, value: string) {
    setPaymentDetails((prev) => ({ ...prev, [key]: value }));
  }

  const previewDigits = number.replace(/\D/g, "");
  const previewHref = previewDigits
    ? whatsappHref(previewDigits, messages.contacto)
    : "";
  const paymentWhatsAppMessage = formatPaymentDetailsForWhatsApp(paymentDetails);
  const paymentWhatsAppHref =
    previewDigits && paymentWhatsAppMessage
      ? whatsappHref(previewDigits, paymentWhatsAppMessage)
      : "";
  const membresiaPreviewMessage = appendPaymentDetailsToMessage(
    messages.membresia,
    paymentDetails
  );
  const membresiaPreviewHref = previewDigits
    ? whatsappHref(previewDigits, membresiaPreviewMessage)
    : "";

  if (loading) {
    return <p className="font-body text-navy/60">Cargando configuración...</p>;
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="card-glass p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <MessageCircle size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-navy">
              WhatsApp Web
            </h2>
            <p className="font-body text-sm text-navy/60">
              Número y mensajes que se abren al hacer clic en los botones de la
              plataforma.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              className="section-label mb-2 block"
              htmlFor="whatsapp-number"
            >
              Número de celular
            </label>
            <input
              id="whatsapp-number"
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="input-field"
              placeholder="+5492216014212"
            />
            <p className="mt-2 font-body text-xs text-navy/50">
              Ejemplo: <span className="font-medium text-gold">+549221</span>
              6014212 — incluí código de país, sin espacios ni guiones.
            </p>
          </div>

          <div className="space-y-4 border-t border-gold/15 pt-6">
            <div>
              <h3 className="font-display text-base font-semibold text-navy">
                Mensajes predeterminados
              </h3>
              <p className="mt-1 font-body text-sm text-navy/60">
                Estos textos aparecen ya escritos cuando alguien abre WhatsApp
                desde la web.
              </p>
            </div>

            {MESSAGE_KEYS.map((key) => {
              const meta = WHATSAPP_MESSAGE_META[key];
              const value = messages[key];
              const charCount = value.length;

              return (
                <div key={key}>
                  <label
                    className="section-label mb-2 block"
                    htmlFor={`whatsapp-message-${key}`}
                  >
                    {meta.label}
                  </label>
                  <textarea
                    id={`whatsapp-message-${key}`}
                    value={value}
                    onChange={(e) => updateMessage(key, e.target.value)}
                    rows={3}
                    maxLength={MAX_WHATSAPP_MESSAGE_LENGTH}
                    className="input-field min-h-[88px] resize-y"
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-body text-xs text-navy/50">{meta.hint}</p>
                    <p className="font-ui text-xs text-navy/40">
                      {charCount}/{MAX_WHATSAPP_MESSAGE_LENGTH}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {previewHref && (
            <div className="rounded-xl border border-gold/20 bg-cream/50 p-4">
              <p className="section-label mb-2">Vista previa (contacto)</p>
              <p className="mb-1 font-body text-sm text-navy">
                {formatWhatsAppDisplay(previewDigits)}
              </p>
              <p className="mb-3 break-words font-body text-sm italic text-navy/70">
                &ldquo;{messages.contacto}&rdquo;
              </p>
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-ui text-sm text-gold hover:text-gold-light"
              >
                Probar en WhatsApp Web
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="card-glass p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Building2 size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-navy">
              Datos bancarios (Argentina)
            </h2>
            <p className="font-body text-sm text-navy/60">
              Completá solo los campos que uses. Se muestran en la web y se
              pueden enviar por WhatsApp.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {PAYMENT_KEYS.map((key) => {
            const meta = PAYMENT_FIELD_META[key];

            return (
              <div key={key}>
                <label
                  className="section-label mb-2 block"
                  htmlFor={`payment-${key}`}
                >
                  {meta.label}{" "}
                  <span className="font-normal normal-case text-navy/40">
                    (opcional)
                  </span>
                </label>
                <input
                  id={`payment-${key}`}
                  type="text"
                  value={paymentDetails[key]}
                  onChange={(e) => updatePaymentDetail(key, e.target.value)}
                  className="input-field"
                  placeholder={meta.placeholder}
                  maxLength={meta.maxLength}
                />
              </div>
            );
          })}

          {hasPaymentDetails(paymentDetails) && (
            <div className="space-y-4 rounded-xl border border-gold/20 bg-cream/50 p-4">
              <div>
                <p className="section-label mb-2">Vista previa del mensaje</p>
                <p className="break-words whitespace-pre-line font-body text-sm text-navy/80">
                  {paymentWhatsAppMessage}
                </p>
              </div>

              {paymentWhatsAppHref && (
                <a
                  href={paymentWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-ui text-sm text-gold hover:text-gold-light"
                >
                  Enviar datos bancarios por WhatsApp
                  <ExternalLink size={14} />
                </a>
              )}

              {membresiaPreviewHref && (
                <div className="border-t border-gold/15 pt-4">
                  <p className="section-label mb-2">
                    Mensaje &ldquo;Quiero unirme&rdquo; con datos incluidos
                  </p>
                  <p className="mb-3 break-words whitespace-pre-line font-body text-sm italic text-navy/70">
                    {membresiaPreviewMessage}
                  </p>
                  <a
                    href={membresiaPreviewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-ui text-sm text-gold hover:text-gold-light"
                  >
                    Probar mensaje de membresía
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full disabled:opacity-70 sm:w-auto"
      >
        {saving ? "Guardando..." : "Guardar configuración"}
      </button>
    </div>
  );
}
