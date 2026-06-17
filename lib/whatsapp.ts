import { prisma } from "@/lib/prisma";

export const WHATSAPP_SETTING_KEY = "whatsapp_number";
export const DEFAULT_WHATSAPP_NUMBER = "5492216014212";

export const WHATSAPP_MESSAGE_KEYS = {
  contacto: "whatsapp_message_contacto",
  membresia: "whatsapp_message_membresia",
  proceso: "whatsapp_message_proceso",
} as const;

export type WhatsAppMessageKey = keyof typeof WHATSAPP_MESSAGE_KEYS;

export const DEFAULT_WHATSAPP_MESSAGES: Record<WhatsAppMessageKey, string> = {
  contacto:
    "Hola, me gustaría obtener más información sobre Consciencia Estelar.",
  membresia:
    "Hola, quiero unirme a la membresía de Consciencia Estelar (Argentina).",
  proceso: "Hola, quiero comenzar mi proceso en Consciencia Estelar.",
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

async function getSettingsMap(keys: string[]): Promise<Map<string, string>> {
  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: keys } },
  });
  return new Map(settings.map((setting) => [setting.key, setting.value]));
}

export async function getWhatsAppNumber(): Promise<string> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: WHATSAPP_SETTING_KEY },
    });
    return setting?.value ?? DEFAULT_WHATSAPP_NUMBER;
  } catch {
    return DEFAULT_WHATSAPP_NUMBER;
  }
}

export async function getWhatsAppMessages(): Promise<
  Record<WhatsAppMessageKey, string>
> {
  try {
    const map = await getSettingsMap(Object.values(WHATSAPP_MESSAGE_KEYS));
    return {
      contacto:
        map.get(WHATSAPP_MESSAGE_KEYS.contacto) ??
        DEFAULT_WHATSAPP_MESSAGES.contacto,
      membresia:
        map.get(WHATSAPP_MESSAGE_KEYS.membresia) ??
        DEFAULT_WHATSAPP_MESSAGES.membresia,
      proceso:
        map.get(WHATSAPP_MESSAGE_KEYS.proceso) ??
        DEFAULT_WHATSAPP_MESSAGES.proceso,
    };
  } catch {
    return { ...DEFAULT_WHATSAPP_MESSAGES };
  }
}

export async function getWhatsAppConfig(): Promise<{
  number: string;
  messages: Record<WhatsAppMessageKey, string>;
}> {
  try {
    const keys = [
      WHATSAPP_SETTING_KEY,
      ...Object.values(WHATSAPP_MESSAGE_KEYS),
    ];
    const map = await getSettingsMap(keys);

    return {
      number: map.get(WHATSAPP_SETTING_KEY) ?? DEFAULT_WHATSAPP_NUMBER,
      messages: {
        contacto:
          map.get(WHATSAPP_MESSAGE_KEYS.contacto) ??
          DEFAULT_WHATSAPP_MESSAGES.contacto,
        membresia:
          map.get(WHATSAPP_MESSAGE_KEYS.membresia) ??
          DEFAULT_WHATSAPP_MESSAGES.membresia,
        proceso:
          map.get(WHATSAPP_MESSAGE_KEYS.proceso) ??
          DEFAULT_WHATSAPP_MESSAGES.proceso,
      },
    };
  } catch {
    return {
      number: DEFAULT_WHATSAPP_NUMBER,
      messages: { ...DEFAULT_WHATSAPP_MESSAGES },
    };
  }
}

export async function setWhatsAppNumber(number: string): Promise<string> {
  const digits = normalizeWhatsAppNumber(number);

  await prisma.platformSetting.upsert({
    where: { key: WHATSAPP_SETTING_KEY },
    create: { key: WHATSAPP_SETTING_KEY, value: digits },
    update: { value: digits },
  });

  return digits;
}

export async function setWhatsAppMessages(
  messages: Partial<Record<WhatsAppMessageKey, string>>
): Promise<Record<WhatsAppMessageKey, string>> {
  const saved = await getWhatsAppMessages();

  for (const key of Object.keys(WHATSAPP_MESSAGE_KEYS) as WhatsAppMessageKey[]) {
    const value = messages[key]?.trim();
    if (value === undefined) continue;

    await prisma.platformSetting.upsert({
      where: { key: WHATSAPP_MESSAGE_KEYS[key] },
      create: { key: WHATSAPP_MESSAGE_KEYS[key], value },
      update: { value },
    });

    saved[key] = value;
  }

  return saved;
}
