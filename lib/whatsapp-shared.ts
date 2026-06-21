export const WHATSAPP_SETTING_KEY = "whatsapp_number";
export const DEFAULT_WHATSAPP_NUMBER = "5492216014212";

export const WHATSAPP_MESSAGE_KEYS = {
  contacto: "whatsapp_message_contacto",
  membresia: "whatsapp_message_membresia",
  proceso: "whatsapp_message_proceso",
  pagosDelMes: "whatsapp_message_pagos_del_mes",
} as const;

export type WhatsAppMessageKey = keyof typeof WHATSAPP_MESSAGE_KEYS;

export const DEFAULT_WHATSAPP_MESSAGES: Record<WhatsAppMessageKey, string> = {
  contacto:
    "Hola, me gustaría obtener más información sobre Consciencia Estelar.",
  membresia:
    "Hola, quiero unirme a la membresía de Consciencia Estelar (Argentina).",
  proceso: "Hola, quiero comenzar mi proceso en Consciencia Estelar.",
  pagosDelMes:
    "Hola {nombres}, te escribimos desde Consciencia Estelar para recordarte el pago de la membresía correspondiente a {mes}. Gracias.",
};

export const WHATSAPP_MESSAGE_META: Record<
  WhatsAppMessageKey,
  { label: string; hint: string }
> = {
  contacto: {
    label: "Contacto general",
    hint: "Se usa en la sección Contacto y en el ícono de WhatsApp del pie de página.",
  },
  membresia: {
    label: "Quiero unirme (Argentina)",
    hint: "Botón de membresía en pesos en la sección de precios.",
  },
  proceso: {
    label: "Comenzar mi proceso",
    hint: "Botón principal al final de la sección de precios.",
  },
  pagosDelMes: {
    label: "Pago del Mes",
    hint: "Mensaje predeterminado al contactar clientes desde Tesorería → Pagos del Mes. Podés usar {nombres}, {apellidos} y {mes}.",
  },
};

export const MAX_WHATSAPP_MESSAGE_LENGTH = 500;

export function normalizeWhatsAppNumber(input: string): string {
  return input.replace(/\D/g, "");
}

export function formatWhatsAppDisplay(number: string): string {
  const digits = normalizeWhatsAppNumber(number);
  return digits ? `+${digits}` : "";
}

export function whatsappHref(number: string, message?: string): string {
  const digits = normalizeWhatsAppNumber(number);
  const base = `https://wa.me/${digits}`;
  const text = message?.trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function isValidWhatsAppNumber(number: string): boolean {
  const digits = normalizeWhatsAppNumber(number);
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidWhatsAppMessage(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_WHATSAPP_MESSAGE_LENGTH;
}

export function applyPagosDelMesMessageTemplate(
  template: string,
  vars: { nombres: string; apellidos: string; mes: string }
): string {
  return template
    .replace(/\{nombres\}/g, vars.nombres)
    .replace(/\{apellidos\}/g, vars.apellidos)
    .replace(/\{mes\}/g, vars.mes);
}

/** Normaliza celular del padrón para wa.me (Argentina: agrega 549 si falta código país). */
export function normalizeClienteCelularForWhatsApp(celular: string): string {
  const digits = normalizeWhatsAppNumber(celular);
  if (!digits) return "";

  if (digits.startsWith("54")) return digits;
  if (digits.length === 10) return `549${digits}`;
  if (digits.length === 11 && digits.startsWith("9")) return `54${digits}`;

  return digits;
}
